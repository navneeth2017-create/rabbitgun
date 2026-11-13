# Rabbitgun — founding plan (v2)

**Date:** 2026-11-13
**Repo:** `navneeth2017-create/rabbitgun`
**One line:** Rabbitgun is the private dashboard of everything Monarch runs on — files, vendors, stores, money, and the AI checks that keep them honest.

---

## 0. Where this fits

You already have three pieces. Rabbitgun is the fourth, and it's the one that holds the others together.

| Piece | What it is | Job |
|---|---|---|
| **Jarvis** (`code/jarvis`) | The in-home AI. Voice, memory, notes, MCP, business feed. | **The voice and the memory.** Answers questions, remembers decisions, talks. |
| **Monarch backend** (`code/monarch-backend`) | Express + Postgres, DSD sales/logistics, live on Railway. | **The engine for one business.** Stores, routes, orders, calls. |
| **Monarch site** (`code/monarchtechusa`) | Static marketing site. | **The storefront.** Sells what we build. |
| **Rabbitgun** (this) | A private dashboard + its own worker, running on the home box. | **The body.** Holds the files, runs the checks, records the approvals. |

**The rule that keeps this from becoming a mess:** Rabbitgun owns *artifacts and evidence* — files, specs, findings, approvals, metrics. Jarvis owns *conversation and recall*. Rabbitgun never tries to be a chatbot; Jarvis never tries to be a file cabinet. They talk over HTTP both ways (§7).

If we build a second memory store inside Rabbitgun, we've built a second brain and both will be wrong. Don't.

---

## 1. What Rabbitgun is

A login-only dashboard for three people. It ingests the real inputs of the business — emails, packaging proofs, PDFs, store numbers — runs named, repeatable AI checks on them, and hands a human a decision with the evidence attached.

**It is not:** a chatbot with a sidebar, an autonomous agent that sends mail or moves money, or a replacement for Shopify/QuickBooks/Gmail. It reads them. It doesn't replace them.

**The difference that matters:** a chatbot answers a question once. Rabbitgun runs the same check the same way every time and keeps the receipt. That receipt is the product — for us internally, and for every business Monarch sells to.

---

## 2. The three users

| Person | Role | What they open it for |
|---|---|---|
| Nav | `owner` | The daily brief. Cash, margin, what's broken, what needs a decision. |
| Dante | `member` | The work queue: vendor threads, proofs waiting, docs to file. |
| Tom | `member` | Packaging checks, printer threads, the approval trail. |

Three seats. Email + password, invite-only, signup disabled. A `viewer` role exists in the schema for later (the printer lady getting a read-only link to one proof), but no UI for it in slice 1.

No enterprise permissions. If we ever need per-SKU access rules, that's a signal we've outgrown the tool, not a feature request.

---

## 3. The one design rule

> **Propose → Approve → Record.**

Every AI output is a proposal attached to the artifact it came from. A human clicks approve. The approval is written with user, timestamp, and file hash.

This matters more than any feature. When 10,000 boxes arrive with the wrong UPC, the question is never "what did the AI think?" It's "who approved this file, when, and what did they see?" Rabbitgun answers that on one screen.

Three hard rules:
1. **No auto-send.** Drafts only, until a human clicks.
2. **No destructive writes** on any connected system. No auto-pay, no auto-delete.
3. **Every finding links to the exact crop** of the exact page it came from. No claim without evidence.

---

## 4. The nine rooms

The dashboard is a building with nine rooms. Each room has one job, and each writes into the Brain.

**Seven entities, one pane of glass:** Addy DSD, Hella Good Energy, Born Again Kratom, Monarch Technologies, Raw Coffee Fiber, WGC Paddy, WowCow. Every room can be scoped to one entity or read as the whole portfolio. A new business gets a row in `entities`, not a new dashboard.

### 4.1 Brief — the front door
What Nav sees at 7am. Not a wall of widgets.
- One paragraph: what happened yesterday, what changed.
- Three things worth looking at, ranked.
- The queue: proofs waiting on approval, docs unfiled, threads going cold.
- A single number: cash on hand, and whether it's trending wrong.

### 4.2 PackCheck — prepress QA
The money feature. Full spec in §5.

### 4.3 Vault — every important document
Full spec in §6.

### 4.4 Inbox — customer and vendor comms
Shared view of the threads that matter (not all mail — the ones tagged to a vendor, a customer issue, or a project).
- Classify: customer issue / vendor / legal / spam / opportunity.
- Summarize the thread, extract commitments and deadlines ("printer said proofs due Friday").
- Draft a reply in house voice, grounded in actual policy.
- SLA nudge: "this customer has waited 2 days."
- The packaging thread lives here and is the input to PackCheck.

### 4.5 Pulse — revenue and sites
One roll-up across every store: revenue, orders, AOV, conversion, ad spend, ROAS, refunds, chargebacks.
- Anomaly detection with a plain-English cause, not just a red number.
- "Store B is 38% below its 14-day baseline since Tuesday. Checkout success dropped at the same time. Two SKUs went out of stock Monday."
- Read-only. One store connected properly beats six connected badly.

### 4.6 Money — where it actually goes

Every entity's money in one flow, top to bottom: net revenue → COGS → platform and card fees → freight → ad spend → refunds and chargebacks → **kept**.

- Every number reconciles to a source: a Shopify payout, a Stripe balance transaction, a carrier invoice, a QuickBooks bill. If two systems disagree, Rabbitgun shows the disagreement instead of averaging it into a lie.
- **Leak detection** is the point of this room: refund-rate drift, DIM-weight reclass on carrier invoices, a processing rate that was never renegotiated, ad spend under the ROAS floor, subscriptions nobody owns, chargebacks that are winnable with evidence already on file.
- Cash: on hand, in transit from processors, bills in the next 14 days, and a runway number Nav can act on.
- Each leak has a dollar figure per month, an owner, and one next action. Not a chart — a decision.

### 4.7 Freight — every box, every mile

- **Today:** to ship, labeled, awaiting pickup, in transit, exceptions.
- **Exceptions ranked by cost of waiting:** bad address, label printed and never scanned, DIM reclass, out of stock after the label printed, late delivery with a customer already chasing.
- **Carrier mix, on-time rate, cost per order** against the negotiated rate card — so "we're paying $0.68 too much a box" is a number, not a feeling.
- **Inbound POs** with ETA, tied back to PackCheck: if the packaging is late and the proof is on hold, the dated run is already gone and the dashboard says so before anyone asks.
- It never guesses. If the carrier hasn't scanned, the row says "no scan", not "delivered".

### 4.8 Brain — search across everything
The query layer over every artifact Rabbitgun holds: docs, emails, decisions, specs, proofs, findings.
- "What did we agree with the printer about the 12 oz run?"
- "Which spec version was live when we approved the June reprint?"
- Answers cite the artifact, the date, and the person. No uncited answers.
- Conversational front-end is **Jarvis**, not a new chat box (§7).

### 4.9 Runbook — obligations
The recurring things that bite when forgotten: filings, renewals, cert expirations, reorder points, proof deadlines, contract notice windows. Auto-created from emails and from PackCheck runs.

**Later, in value order:** vendor scorecards (which printer is late or wrong most often — Rabbitgun accumulates this for free), reorder forecasting, ad-claim QA, trademark screen on new copy.

---

## 5. PackCheck in detail

### 5.1 Two gates, not one

**Gate 1 — outbound.** Our artwork, before it's sent to the printer.
**Gate 2 — inbound.** The printer's proof, before we approve the run.

Printers "helpfully" fix things: substitute a font, relink last year's logo, re-flow a panel, swap a spot color, quietly reuse an old dieline. Gate 2 catches that. It's also the gate that produces the CYA record.

### 5.2 What gets checked

**Codes — the expensive one**
- UPC/EAN/GTIN decoded, check digit validated, matched to the SKU master. Catches the one-digit error that costs a reprint plus retail chargebacks.
- QR destination resolves and matches the approved URL.
- Lot / best-by format matches the printer's requirement.

**Copy and claims**
- Character-level diff against the approved copy block (whitespace and case normalized, so it flags real changes only).
- Risky-claim list: `cures`, `FDA approved`, `clinically proven`, `all natural`, `non-toxic` — flagged unless a substantiation file is attached to the SKU.
- Required disclosures: net weight, ingredients, allergens, directions, warnings, company address, country of origin, lot placeholder.
- Spelling/grammar — flag only. **Never auto-rewrite legal or regulated text.**

**Geometry**
- Trim size vs spec, within tolerance.
- Bleed ≥ printer minimum (e.g. 0.125").
- Safe margin: no text or logo inside the keep-out.
- Dieline version matches the current approved dieline.
- Panel count and fold order.
- Minimum type size.

**Assets**
- Logo version and clearspace.
- Spot color *names* match the printer's ink list.
- Image resolution ≥ 300 ppi at final size.
- Fonts embedded or outlined.

**Version**
- File hash + filename convention + proof version.
- **Diff against the last approved version** — what actually changed since sign-off. The single most useful screen in the product.

### 5.3 The output

1. Verdict: `PASS` / `PASS WITH NOTES` / `HOLD`.
2. Findings sorted by severity, each with a crop of the exact spot on the exact panel.
3. Annotated PDF to send back.
4. A reply-to-printer email drafted, quoting each fix and the exact correction.
5. The approval record: who, when, which file hash, which spec version.

Target: under 90 seconds upload → report.

### 5.4 What it honestly cannot do

Say this on the marketing page. It builds more trust than any feature list.
- **Color fidelity cannot be judged from a PDF.** Screen PDFs lie; color needs a physical proof and a spectrophotometer. We check color *names and consistency*, not accuracy.
- Overprint, trapping, rich-black are heuristic, not preflight-grade.
- OCR misreads tiny type. Low-confidence reads get flagged for human eyes, never auto-failed.
- Regulatory and legal sign-off stays human. We surface; we don't certify.

### 5.5 The spec master problem

You told me the approved packaging truth is scattered across spreadsheets, PDFs, and email threads. So the spec builder **is part of slice 1**, not a prerequisite.

Order of operations that doesn't stall:
1. Upload the last *approved* artwork PDF for a SKU.
2. Rabbitgun extracts a draft spec (copy blocks, UPC, dims, panels, colors) and shows it with confidence per field.
3. Tom corrects it once, clicks **Lock spec** → `spec_version 1`.
4. Every future proof is checked against that locked version. Changes create version 2, never an edit.

Three SKUs to start. Pick the ones that get reprinted most.

---

## 6. Vault — every important document

Plain rule: **if losing it would hurt, it goes in the Vault.** Not a file share — an evidence locker.

### 6.1 What lives there
- Packaging specs + approved artwork (each SKU, every version)
- Printer proofs + approvals
- Vendor agreements, COIs, W-9s, NDAs, terms
- Certificates: organic, NSF, kosher, FDA registration, state licenses
- Lab results / COAs per lot
- UPC/GTIN registry and GS1 paperwork
- Insurance policies, leases, equipment warranties
- Formation docs, EIN, resale certificates, trademarks
- SOPs, dielines, brand kits, fonts, logos
- Tax filings and notices
- Anything a lawyer, auditor, or buyer would ask for

### 6.2 What happens on ingest
1. Upload, email-in (`vault@rabbitgun.com`), or drag from a thread.
2. SHA-256 hash → duplicate detection, and a permanent fingerprint.
3. Text layer extracted; OCR fallback for scans.
4. Auto-tag: vendor, SKU, doc type, dates, expiry, dollar amounts, people named.
5. Draft a title in plain English ("Organic cert — Born Again Kratom — expires Mar 2027").
6. Human confirms tags → filed.
7. Text chunked + embedded → searchable in Brain.
8. If it has an expiry or renewal date, a Runbook task is created automatically.

### 6.3 Rules
- **Immutable versions.** A new upload supersedes; it never overwrites. Old versions stay retrievable forever.
- **Nothing is deleted**, only archived, with who and why.
- **Every download is logged** (who, when, which version). Matters for vendor disputes and diligence.
- **Backups:** nightly encrypted copy to Backblaze B2 (you already have that plumbing in `monarch-backend/src/jobs/backupToB2.js`), 30-day versioning.
- **Sensitive docs** (tax, formation, IDs) get a `restricted` flag: visible to `owner` only until explicitly shared.

### 6.4 Why this is the real moat
The packaging checker is the demo. The Vault is the reason they never leave. Once a business's institutional memory lives in one searchable place, switching costs are enormous — and diligence, insurance, and vendor disputes all get easier. Same reason it's worth building for us first: we become the case study.

---

## 7. Jarvis integration — both directions

**Rabbitgun → Jarvis**
- Every approval, hold, and spec lock posts a note: `POST /note` with tags `rabbitgun,approval,<sku>`.
- Every PackCheck verdict posts a one-line summary so Jarvis can answer "did the new boxes pass?"
- Vault ingests post a note for high-value docs ("COI for printer expires in 30 days").

**Jarvis → Rabbitgun**
- Rabbitgun exposes a read-only feed, same shape as the one `monarch-backend` already gives Jarvis:
  - `GET /api/jarvis/brief` — proofs waiting, holds, docs expiring, revenue snapshot
  - `GET /api/jarvis/sku?q=` — spec status for a product
  - `GET /api/jarvis/thread?q=` — the printer thread summary
- Bearer token (`RABBITGUN_FEED_TOKEN`), read-only, no writes from that surface.
- So "Jarvis, did the new packaging pass?" works with no new voice work. Jarvis just calls the feed.

**Shared vocabulary:** `vendor`, `sku`, `spec`, `proof`, `finding`, `approval`, `thread`, `doc`, `metric`, `task`. Jarvis's note tags should use these exact words so search across both systems lines up.

---

## 8. Architecture

Scale target: 3 users, tens of proofs a month, thousands of metric rows a day. Build for that. Not for a thousand tenants.

```
┌──────────────────────────────┐        ┌───────────────────────────┐
│  Next.js app (UI + API)      │        │  Worker (node)            │
│  auth, dashboard, approvals  │◀──────▶│  pdf, ocr, checks, sync   │
└──────────────┬───────────────┘        └─────────────┬─────────────┘
               │                                      │
        ┌──────▼──────┐   ┌──────────────┐   ┌────────▼────────┐
        │ Postgres    │   │ Object store │   │ Model calls     │
        │ + pgvector  │   │ (B2 / local) │   │ paid, zero-ret  │
        └─────────────┘   └──────────────┘   └─────────────────┘
               ▲
        ┌──────┴──────┐
        │  Jarvis     │  voice + memory, reads /api/jarvis/*
        └─────────────┘
```

- **App:** Next.js (App Router) + TypeScript + Tailwind. Server components for reads, server actions for writes.
- **DB:** Postgres + `pgvector`. Local dev via Docker; prod on Railway (where Monarch already lives).
- **Files:** S3-compatible (Backblaze B2) in prod, local `./data/files` in dev. Never in the repo.
- **Jobs:** a `jobs` table + a `worker` process (`npm run worker`) — the same pattern as `monarch-backend`, no new platform to learn.
- **Auth:** email + password (bcrypt) + signed HTTP-only cookie. Invite-only, three rows in `users`.
- **PDF pipeline:** `pdfjs-dist` for text + bounding boxes, `sharp` for rasterizing panels, a barcode decoder for UPC/QR. Python sidecar only if extraction quality demands it.
- **AI:** `@anthropic-ai/sdk` (already in the stack) for vision + drafting, strict JSON-schema output. Embeddings locally via `@xenova/transformers` MiniLM (same as Jarvis) so document text doesn't need to leave the box.
- **Hosting:** runs on the home box (`docker compose up`) and is reachable over Tailscale or a Cloudflare Tunnel. Railway is the fallback for when the box is down. Same code, two places.
- **Design:** same warm dark palette as monarchtechusa (`--bg #14110e`, `--ember #e8873b`), Fraunces / Instrument Sans / IBM Plex Mono. Denser than the marketing site — this is an instrument panel, not a brochure.

### Model policy — non-negotiable
Business data (packaging artwork, customer emails, vendor pricing) does **not** go through free-tier models. Free tiers commonly retain data and may train on it. Paid, zero-retention endpoint only. This is a code-review rule, not a preference.

### Security baseline
- `noindex`, no public signup, rate-limited login, 12-hour sessions.
- Row-level scoping by workspace even though there's one workspace — cheap now, painful later.
- Secrets in env only; `.env` gitignored; `.env.example` documents every key.
- Audit log on: login, download, approval, spec lock, delete/archive.
- Encrypted backups, tested restore once before go-live.

---

## 9. Rollout

| Slice | Scope | Why |
|---|---|---|
| **1** (wk 1–2) | Shell + Brief + **PackCheck** (spec builder, upload, report, email draft, approve) + Vault ingest for packaging docs | Solves Tom's actual problem and is demoable in five minutes |
| **2** (wk 3–4) | Inbox intake (forward-to address), thread summary, reply drafts, approval | Packaging work arrives by email; closes the loop |
| **3** (wk 5–6) | Pulse: one store connected, daily brief, anomaly alerts | Daily habit for Nav |
| **4** | Brain search over everything, Runbook obligations, Jarvis feed both ways | Turns four tools into one system |
| **5** | Vendor scorecards, reorder forecasting, ad-claim QA | Only once the data exists |

Slice 1 is the whole bet. If the report isn't obviously right on a real proof, nothing else matters.

---

## 10. Monarch marketing — selling the packaging checker

**Buyer:** CPG brands printing packaging (supplement, food, beauty, beverage), agencies, co-packers, and printers who want fewer reprints.

**The economics that sell it:** one wrong UPC on a 5,000-unit run is a reprint, a missed retail window, and chargebacks. Easily five figures. A check costs a rounding error against that.

**Product name:** **Monarch Preflight**. "Preflight" is the word print people already use.

**Page outline**
1. Hero: *Nothing goes to print unchecked.*
2. The five failures that cost the most (wrong UPC, stale claim, missing panel, wrong dieline version, printer-substituted asset) — each with a dollar range.
3. How it works: upload → 90-second report → approve → printer reply drafted.
4. What we check — the §5.2 table.
5. **What it doesn't replace** — human legal/regulatory review, physical color proof. Trust builder.
6. The receipt — approval trail, file hash, spec version. "Know exactly what you signed off on."
7. Offer.

**Offer shapes**
- Single proof check — tripwire, ~$99–149.
- Monthly — N proofs/month per brand.
- White-label for printers and agencies — best distribution, they resell it.
- Done-for-you — Monarch runs it, you get the report.

**Claims discipline:** say *assist, flag, review support, catch*. Never *guarantee, compliant, certified, FDA-approved*. Plain disclaimer on the page and in the report footer. Liability boundary, not modesty.

---

## 11. Decisions locked

- Internal name: **Rabbitgun**. Never marketed.
- Public product name: **Monarch Preflight**.
- Three seats: Nav (owner), Dante, Tom.
- Stack: Next.js + Postgres/pgvector + B2, worker process, runs on the home box first.
- Jarvis stays the voice and memory; Rabbitgun is the body.
- Slice 1 = PackCheck + Vault.

## 12. Still open

1. Which 3 SKUs to seed the spec master from (the most-reprinted ones).
2. Which single store to connect first for Pulse.
3. Gmail vs Outlook as the first inbox (both are on the list).
4. Whether the printer ever gets a viewer link, or always gets PDFs by email.
