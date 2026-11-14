# Rabbitgun

The private dashboard for Monarch operations. One login for Nav, Dante, and Tom: every entity's money, every shipment, every important document, and the AI checks that keep them honest.

**Ran with sample data so it runs on day one.** Nothing here talks to a live store, inbox, or printer yet — the seams are marked in the code.

---

## What this is

Rabbitgun is the **body**; Jarvis is the **voice and memory**.

| Piece | Job |
|---|---|
| **Rabbitgun** | Holds artifacts and evidence — files, specs, findings, approvals, metrics. Runs the checks. |
| **Jarvis** (`../jarvis`) | Conversation, voice, long-term recall over MCP. Reads Rabbitgun through `/api/jarvis/*`. |
| **Monarch backend** | DSD engine: stores, routes, orders, calls. |
| **Monarch site** | Sells the capability — the packaging checker becomes **Monarch Preflight**. |

Rabbitgun never becomes a chatbot. Jarvis never becomes a file cabinet. They talk over HTTP both ways.

---

## The one rule

**Propose → Approve → Record.**

Every AI output is a proposal attached to the artifact it came from. A human approves. The approval is written with user, timestamp, and file hash. When a run is wrong, the question is never "what did the AI think?" — it's "who approved this file, when, and what did they see?"

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Sample data renders on every screen. No database required for the UI — with no `DATABASE_URL`, the app runs in **preview mode**: everything visible, no login, and the sidebar says so.

When a `DATABASE_URL` exists, **auth switches on automatically**: every room sits behind login (Nav, Dante, Tom only), sessions are DB-backed and revocable, and the sidebar shows who is signed in.

### Going live (Railway or local Postgres)

1. Point `DATABASE_URL` at a Postgres 16 (+ pgvector) database.
2. Give the three humans passwords: set `NAV_PASSWORD`, `DANTE_PASSWORD`, `TOM_PASSWORD` (or one `RABBITGUN_INITIAL_PASSWORD` for all three).
3. Restart. On first use the app creates the core tables and seeds the users + the 7 entities itself — no manual SQL needed.

Manual alternative for local work:

```bash
psql "$DATABASE_URL" -f db/schema.sql   # full canonical schema
node db/seed-users.mjs                  # or let the app bootstrap itself
```

The jobs worker, migrations runner, and connectors land with slice 1 — the schema and the `jobs` table are already shaped for them. Nothing in this repo writes to a live system yet.

---

## Screens

| Route | What it does |
|---|---|
| `/` | **Brief** — one paragraph, three things, portfolio totals, queue. |
| `/packcheck` | **PackCheck** — proof list, verdicts, blockers. |
| `/packcheck/[id]` | The report: annotated proof, findings with expected vs actual, printer email draft, approval record. |
| `/inbox` | Threads tied to money — classified, summarized, ask extracted, drafts grounded in policy. |
| `/runbook` | Obligations with owners and dates. |
| `/vault` | Every document that would hurt to lose. Versioned, hashed, expiring. |
| `/pulse` | Revenue by entity. Filter with `?e=`. |
| `/money` | The flow: revenue → COGS → fees → freight → ads → refunds → kept. Plus where it leaks. |
| `/freight` | Today's boxes, exceptions, carrier mix, inbound POs. |
| `/brain` | Search across specs, docs, threads, decisions, proofs. Every hit links to the source. |

The top bar is a real search form; `/brain?q=` actually filters the demo corpus.

---

## Layout

```
app/(dash)/          every room (behind login when a DB exists)
app/login/           the gate
app/api/auth/        login + logout
components/          shell, icons, proof sheet, approval, entity tabs
lib/db.ts            Postgres pool
lib/session.ts       DB-backed sessions (bcrypt + httpOnly cookie)
lib/bootstrap.ts     idempotent tables + seed on first use
lib/demo.ts          sample proofs, docs, threads, tasks, decisions
lib/portfolio.ts     entities, money flow, leaks, freight, cash
db/schema.sql        Postgres + pgvector, append-only where it matters
db/seed-users.mjs    manual seed (the app also self-seeds)
app/api/jarvis/      read-only feed for the in-home Jarvis
```

---

## Jarvis integration

**Rabbitgun → Jarvis:** approvals and holds post notes (`POST /note`) tagged `rabbitgun,approval,<sku>`.

**Jarvis → Rabbitgun:** `GET /api/jarvis/brief` with `Authorization: Bearer $RABBITGUN_FEED_TOKEN`. Returns portfolio totals, per-entity numbers, proof verdicts, and a `say` line ready for TTS.

```bash
curl -H "Authorization: Bearer $RABBITGUN_FEED_TOKEN" \
  http://localhost:3000/api/jarvis/brief
```

So "Jarvis, is the new packaging good to print?" works with no new voice code.

---

## Model policy

Business data — packaging artwork, customer emails, vendor pricing — **never** goes through a free-tier model. Free tiers commonly retain data and may train on it. Paid, zero-retention endpoints only. This is a review rule, not a preference.

---

## What's real vs. sample

**Real:** routing, layout, search, filtering, the approval interaction, the schema, the Jarvis feed shape.

**Sample:** every number, document, thread, and proof. There is a `sample data` badge in the header until a real connector is wired.

---

## Roadmap

1. **Slice 1** — PackCheck: spec builder, upload, report, printer draft, approval. Vault ingest for packaging docs.
2. **Slice 2** — Inbox intake (`vault@` / forward-to address), thread summaries, reply drafts.
3. **Slice 3** — Pulse: one store connected, daily brief, anomaly alerts.
4. **Slice 4** — Brain search over real documents, Runbook obligations, Jarvis feed both ways.
5. **Slice 5** — vendor scorecards, reorder forecasting, ad-claim QA.

Full reasoning: [`PLAN.md`](./PLAN.md).
