-- Seeds the three humans and the seven entities.
-- Run once per database:  node db/seed-users.mjs
-- Requires DATABASE_URL. Passwords come from env — never hardcode them here.

import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

const people = [
  { email: "nav@rabbitgun.internal", name: "Nav", role: "owner", env: "NAV_PASSWORD" },
  { email: "dante@rabbitgun.internal", name: "Dante", role: "member", env: "DANTE_PASSWORD" },
  { email: "tom@rabbitgun.internal", name: "Tom", role: "member", env: "TOM_PASSWORD" },
];

const entities = [
  ["addy", "Addy DSD", "DSD", "addydsd.com"],
  ["hellagood", "Hella Good Energy", "DTC", "hellagoodenergy.com"],
  ["bornagain", "Born Again Kratom", "DTC", "bornagainkratom.com"],
  ["monarch", "Monarch Technologies", "Services", "monarchtechusa.com"],
  ["rawcoffee", "Raw Coffee Fiber", "DTC", "rawcoffeefiber.com"],
  ["wgc", "WGC Paddy", "DTC", "wgcpaddy.com"],
  ["wowcow", "WowCow Distributors", "Wholesale", "wowcowdistributors.com"],
];

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Point it at your Postgres (Railway or local) and re-run.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: /sslmode=require/.test(url) || process.env.PGSSL === "require"
    ? { rejectUnauthorized: false }
    : undefined,
});

try {
  for (const p of people) {
    const password = process.env[p.env] || process.env.RABBITGUN_INITIAL_PASSWORD;
    if (!password) {
      console.error(`- ${p.name}: no ${p.env} (or RABBITGUN_INITIAL_PASSWORD) set — skipped.`);
      continue;
    }
    const hash = bcrypt.hashSync(password, 12);
    await pool.query(
      `insert into users (email, name, role, password_hash)
       values ($1, $2, $3, $4)
       on conflict (email) do update
         set password_hash = excluded.password_hash, name = excluded.name, role = excluded.role`,
      [p.email, p.name, p.role, hash],
    );
    console.log(`+ ${p.name} (${p.email}) ready.`);
  }

  for (const [id, name, kind, domain] of entities) {
    await pool.query(
      `insert into entities (id, name, kind, domain)
       values ($1, $2, $3, $4)
       on conflict (id) do update
         set name = excluded.name, kind = excluded.kind, domain = excluded.domain`,
      [id, name, kind, domain],
    );
  }
  console.log("+ 7 entities seeded.");
} finally {
  await pool.end();
}
