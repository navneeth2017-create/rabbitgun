-- Rabbitgun schema · Postgres 16 + pgvector
-- Everything that matters is append-only. You never overwrite an approval,
-- a spec version, or a document version — you supersede it.

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ---------------------------------------------------------------- people

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text not null,
  password_hash text not null,
  role          text not null default 'member' check (role in ('owner','member','viewer')),
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz
);

create table sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index on sessions (user_id);

create table audit_log (
  id         bigserial primary key,
  user_id    uuid references users(id),
  action     text not null,             -- login, download, approve, spec_lock, archive
  subject    text not null,             -- table:uuid
  meta       jsonb not null default '{}',
  at         timestamptz not null default now()
);
create index on audit_log (subject);
create index on audit_log (at desc);

-- ---------------------------------------------------------------- money

create table entities (
  id         text primary key,          -- addy, hellagood, monarch…
  name       text not null,
  kind       text not null check (kind in ('DTC','DSD','Services','Product')),
  domain     text,
  active     boolean not null default true
);

create table stores (
  id         uuid primary key default gen_random_uuid(),
  entity_id  text not null references entities(id) on delete cascade,
  platform   text not null,             -- shopify, woocommerce, amazon, stripe
  domain     text,
  external_id text,
  currency   text not null default 'USD'
);

create table metric_daily (
  entity_id   text not null references entities(id) on delete cascade,
  store_id    uuid references stores(id) on delete set null,
  day         date not null,
  revenue     numeric(12,2) not null default 0,
  orders      integer not null default 0,
  refunds     numeric(12,2) not null default 0,
  cogs        numeric(12,2) not null default 0,
  fees        numeric(12,2) not null default 0,
  shipping    numeric(12,2) not null default 0,
  ad_spend    numeric(12,2) not null default 0,
  sessions    integer,
  primary key (entity_id, store_id, day)
);
create index on metric_daily (day desc);

create table shipments (
  id          uuid primary key default gen_random_uuid(),
  entity_id   text not null references entities(id) on delete cascade,
  order_ref   text not null,
  carrier     text,
  service     text,
  cost        numeric(10,2),
  weight_actual numeric(8,2),
  weight_billed numeric(8,2),
  status      text not null default 'label' check (status in ('label','picked_up','in_transit','delivered','exception','returned')),
  exception   text,
  shipped_at  timestamptz,
  delivered_at timestamptz
);
create index on shipments (entity_id, status);
create index on shipments (shipped_at desc);

-- ---------------------------------------------------------------- vendors + specs

create table vendors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        text not null default 'printer',   -- printer, co-packer, supplier, carrier
  contact_name text,
  contact_email text,
  terms       text,
  active      boolean not null default true
);

create table skus (
  id          uuid primary key default gen_random_uuid(),
  entity_id   text not null references entities(id) on delete cascade,
  code        text not null,                    -- BAK-MD-250
  name        text not null,
  gtin        text,                             -- 14-digit GTIN, check digit validated on write
  unique (entity_id, code)
);

create table spec_versions (
  id           uuid primary key default gen_random_uuid(),
  sku_id       uuid not null references skus(id) on delete cascade,
  version      integer not null,
  approved_copy jsonb not null,                 -- copy blocks per panel, exact strings
  dims         jsonb,                           -- trim, bleed, safe, dieline id/version
  required_text text[],                         -- warning, allergen, origin…
  spot_colors  text[],
  substantiation_doc_id uuid,                   -- claims need a source
  locked_by    uuid references users(id),
  locked_at    timestamptz,
  supersedes   uuid references spec_versions(id),
  unique (sku_id, version)
);

-- ---------------------------------------------------------------- proofs + checks

create table proofs (
  id            uuid primary key default gen_random_uuid(),
  sku_id        uuid not null references skus(id) on delete cascade,
  vendor_id     uuid references vendors(id),
  direction     text not null check (direction in ('outbound','inbound')),
  version       integer not null,
  filename      text not null,
  storage_key   text not null,
  sha256        text not null,
  bytes         bigint,
  pages         integer,
  received_at   timestamptz not null default now(),
  unique (sku_id, direction, sha256)
);

create table check_runs (
  id             uuid primary key default gen_random_uuid(),
  proof_id       uuid not null references proofs(id) on delete cascade,
  spec_version_id uuid not null references spec_versions(id),
  engine_version text not null,                 -- prompt + extractor version, for reproducibility
  verdict        text not null check (verdict in ('PASS','PASS WITH NOTES','HOLD')),
  duration_ms    integer,
  created_at     timestamptz not null default now()
);

create table findings (
  id           uuid primary key default gen_random_uuid(),
  check_run_id uuid not null references check_runs(id) on delete cascade,
  code         text not null,                   -- UPC-01, NETWT-04
  severity     text not null check (severity in ('blocker','warning','note')),
  sheet        text,
  title        text not null,
  expected     text,
  actual       text,
  detail       text,
  confidence   numeric(4,3),
  bbox         jsonb,                           -- {x,y,w,h} as page fractions
  crop_key     text
);
create index on findings (check_run_id, severity);

create table approvals (
  id           uuid primary key default gen_random_uuid(),
  proof_id     uuid not null references proofs(id),
  check_run_id uuid references check_runs(id),
  user_id      uuid not null references users(id),
  decision     text not null check (decision in ('approved','held')),
  proof_sha256 text not null,
  note         text,
  at           timestamptz not null default now()
);
create index on approvals (proof_id, at desc);

-- ---------------------------------------------------------------- vault

create table documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  kind        text not null,                    -- contract, spec, COI, COA, tax…
  entity_id   text references entities(id) on delete set null,
  vendor_id   uuid references vendors(id) on delete set null,
  sku_id      uuid references skus(id) on delete set null,
  restricted  boolean not null default false,
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);

create table document_versions (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references documents(id) on delete cascade,
  version      text not null,
  storage_key  text not null,
  sha256       text not null,
  bytes        bigint,
  text_content text,
  expires_on   date,
  uploaded_by  uuid references users(id),
  uploaded_at  timestamptz not null default now(),
  supersedes   uuid references document_versions(id),
  unique (document_id, sha256)
);
create index on document_versions (expires_on) where expires_on is not null;

create table document_tags (
  document_id uuid not null references documents(id) on delete cascade,
  tag         text not null,
  primary key (document_id, tag)
);

create table document_chunks (
  id          bigserial primary key,
  version_id  uuid not null references document_versions(id) on delete cascade,
  chunk       text not null,
  embedding   vector(384)                       -- MiniLM, same model Jarvis uses
);
create index on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------------------------------------------------------------- comms

create table threads (
  id           uuid primary key default gen_random_uuid(),
  entity_id    text references entities(id) on delete set null,
  vendor_id    uuid references vendors(id) on delete set null,
  kind         text not null check (kind in ('customer','vendor','legal','opportunity','other')),
  subject      text,
  external_id  text,
  last_message_at timestamptz,
  state        text not null default 'open' check (state in ('open','waiting','filed'))
);

create table messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references threads(id) on delete cascade,
  direction  text not null check (direction in ('in','out')),
  from_addr  text,
  to_addr    text[],
  subject    text,
  body       text,
  sent_at    timestamptz not null,
  external_id text
);
create index on messages (thread_id, sent_at);

create table drafts (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references threads(id) on delete cascade,
  body       text not null,
  model      text,
  created_at timestamptz not null default now(),
  approved_by uuid references users(id),
  approved_at timestamptz,
  sent_at     timestamptz
);

-- ---------------------------------------------------------------- memory + work

create table decisions (
  id         uuid primary key default gen_random_uuid(),
  entity_id  text references entities(id) on delete set null,
  user_id    uuid references users(id),
  text       text not null,
  tags       text[] not null default '{}',
  source     text,                              -- thread:…, proof:…, manual
  at         timestamptz not null default now()
);
create index on decisions using gin (tags);

create table tasks (
  id          uuid primary key default gen_random_uuid(),
  entity_id   text references entities(id) on delete set null,
  title       text not null,
  detail      text,
  owner_id    uuid references users(id),
  due_on      date,
  source      text,                             -- vault:…, thread:…, packcheck:…
  done_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index on tasks (due_on) where done_at is null;

create table jobs (
  id          bigserial primary key,
  kind        text not null,                    -- pdf.extract, pdf.check, email.sync, metrics.pull
  payload     jsonb not null default '{}',
  status      text not null default 'queued' check (status in ('queued','running','done','failed')),
  attempts    integer not null default 0,
  run_after   timestamptz not null default now(),
  locked_at   timestamptz,
  error       text,
  created_at  timestamptz not null default now()
);
create index on jobs (status, run_after);
