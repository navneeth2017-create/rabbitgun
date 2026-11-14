import bcrypt from "bcryptjs";
import { db, hasDatabase } from "@/lib/db";

/**
 * Idempotent bootstrap so a fresh Postgres (Railway or local) becomes usable
 * with zero manual steps: core tables, then the three humans + seven entities
 * if passwords were provided via env. Runs once per process, lazily, before
 * the first auth query. The full canonical schema stays in db/schema.sql.
 */
let ready: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!hasDatabase()) return Promise.resolve();
  if (!ready) {
    ready = init().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

const people = [
  { email: "nav@rabbitgun.internal", name: "Nav", role: "owner", env: "NAV_PASSWORD" },
  { email: "dante@rabbitgun.internal", name: "Dante", role: "member", env: "DANTE_PASSWORD" },
  { email: "tom@rabbitgun.internal", name: "Tom", role: "member", env: "TOM_PASSWORD" },
] as const;

/**
 * Placeholder passwords so the three humans can get in on day one and change
 * them later. They are deliberately obvious, and the dashboard nags until
 * real passwords arrive via env (NAV_PASSWORD / DANTE_PASSWORD / TOM_PASSWORD
 * or RABBITGUN_INITIAL_PASSWORD).
 */
const FALLBACK_PASSWORDS: Record<string, string> = {
  NAV_PASSWORD: "changeme-nav",
  DANTE_PASSWORD: "changeme-dante",
  TOM_PASSWORD: "changeme-tom",
};

let usedFallback = false;
export const usingDefaultPasswords = () => usedFallback;

const entities: [string, string, string, string][] = [
  ["addy", "Addy DSD", "DSD", "addydsd.com"],
  ["hellagood", "Hella Good Energy", "DTC", "hellagoodenergy.com"],
  ["bornagain", "Born Again Kratom", "DTC", "bornagainkratom.com"],
  ["monarch", "Monarch Technologies", "Services", "monarchtechusa.com"],
  ["rawcoffee", "Raw Coffee Fiber", "DTC", "rawcoffeefiber.com"],
  ["wgc", "WGC Paddy", "DTC", "wgcpaddy.com"],
  ["wowcow", "WowCow Distributors", "Wholesale", "wowcowdistributors.com"],
];

async function init() {
  const pool = db();

  for (const ext of ["pgcrypto", "vector"]) {
    try {
      await pool.query(`create extension if not exists "${ext}"`);
    } catch (err) {
      console.warn(`[bootstrap] extension ${ext} unavailable:`, (err as Error).message);
    }
  }

  await pool.query(`
    create table if not exists users (
      id            uuid primary key default gen_random_uuid(),
      email         text not null unique,
      name          text not null,
      password_hash text not null,
      role          text not null default 'member' check (role in ('owner','member','viewer')),
      created_at    timestamptz not null default now(),
      last_seen_at  timestamptz
    )
  `);

  await pool.query(`
    create table if not exists sessions (
      id         uuid primary key default gen_random_uuid(),
      user_id    uuid not null references users(id) on delete cascade,
      token_hash text not null unique,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `);
  await pool.query(`create index if not exists sessions_user_id on sessions (user_id)`);

  await pool.query(`
    create table if not exists audit_log (
      id      bigserial primary key,
      user_id uuid references users(id),
      action  text not null,
      subject text not null,
      meta    jsonb not null default '{}',
      at      timestamptz not null default now()
    )
  `);
  await pool.query(`create index if not exists audit_log_subject on audit_log (subject)`);
  await pool.query(`create index if not exists audit_log_at on audit_log (at desc)`);

  await pool.query(`
    create table if not exists entities (
      id     text primary key,
      name   text not null,
      kind   text not null check (kind in ('DTC','DSD','Services','Product','Wholesale')),
      domain text,
      active boolean not null default true
    )
  `);

  // ---- seed: people -------------------------------------------------------
  for (const p of people) {
    const fromEnv = process.env[p.env] || process.env.RABBITGUN_INITIAL_PASSWORD;
    const password = fromEnv || FALLBACK_PASSWORDS[p.env];
    if (!fromEnv) usedFallback = true;
    await pool.query(
      `insert into users (email, name, role, password_hash)
       values ($1, $2, $3, $4)
       on conflict (email) do update
         set password_hash = excluded.password_hash, name = excluded.name, role = excluded.role
       where users.password_hash is distinct from excluded.password_hash
          or users.name is distinct from excluded.name
          or users.role is distinct from excluded.role`,
      [p.email, p.name, p.role, bcrypt.hashSync(password, 12)],
    );
  }

  // ---- vendors + skus + spec_versions (the PackCheck spine) ----------------
  await pool.query(`
    create table if not exists vendors (
      id           uuid primary key default gen_random_uuid(),
      name         text not null,
      kind         text not null default 'printer',
      contact_name text,
      contact_email text,
      terms        text,
      active       boolean not null default true
    )
  `);

  await pool.query(`
    create table if not exists skus (
      id        uuid primary key default gen_random_uuid(),
      entity_id text not null references entities(id) on delete cascade,
      code      text not null,
      name      text not null,
      gtin      text,
      unique (entity_id, code)
    )
  `);

  await pool.query(`
    create table if not exists spec_versions (
      id            uuid primary key default gen_random_uuid(),
      sku_id        uuid not null references skus(id) on delete cascade,
      version       integer not null,
      approved_copy jsonb not null,
      dims          jsonb,
      required_text text[],
      spot_colors   text[],
      created_at    timestamptz not null default now(),
      locked_by     uuid references users(id),
      locked_at     timestamptz,
      supersedes    uuid references spec_versions(id),
      unique (sku_id, version)
    )
  `);

  // ---- private rooms: personal notes + AI conversation memory -------------
  await pool.query(`
    create table if not exists personal_notes (
      id         uuid primary key default gen_random_uuid(),
      user_id    uuid not null references users(id) on delete cascade,
      title      text not null default '',
      body       text not null,
      tags       text[] not null default '{}',
      created_at timestamptz not null default now()
    )
  `);
  await pool.query(`create index if not exists personal_notes_user on personal_notes (user_id, created_at desc)`);

  await pool.query(`
    create table if not exists ai_chats (
      id      uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      topic   text not null,
      summary text not null,
      model   text,
      at      timestamptz not null default now()
    )
  `);
  await pool.query(`create index if not exists ai_chats_user on ai_chats (user_id, at desc)`);

  // ---- the brain: embedded knowledge (local MiniLM, vector 384) ------------
  await pool.query(`
    create table if not exists knowledge (
      id         bigserial primary key,
      source     text not null,
      title      text not null,
      chunk      text not null,
      tags       text[] not null default '{}',
      embedding  vector(384),
      created_at timestamptz not null default now()
    )
  `);
  await pool.query(`create index if not exists knowledge_tags on knowledge using gin (tags)`);

  // ---- seed: entities -----------------------------------------------------
  for (const [id, name, kind, domain] of entities) {
    await pool.query(
      `insert into entities (id, name, kind, domain)
       values ($1, $2, $3, $4)
       on conflict (id) do update
         set name = excluded.name, kind = excluded.kind, domain = excluded.domain`,
      [id, name, kind, domain],
    );
  }
}
