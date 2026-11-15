import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/bootstrap";
import { checkProof, type CheckFinding, type ProofInput, type Verdict } from "@/lib/checker";
import type { SessionUser } from "@/lib/session";
import type { SpecPayload } from "@/lib/specs";

/**
 * Proofs and check runs, against the canonical schema: a proof is an
 * immutable artifact (identified by a hash of what was submitted), a check
 * run grades it against one locked spec version, findings hang off the run,
 * and approvals are receipts that never overwrite each other.
 */

export type LockedSpecOption = {
  skuId: string;
  code: string;
  name: string;
  gtin: string | null;
  entity: string;
  specId: string;
  version: number;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export type LockedSpec = LockedSpecOption & {
  payload: SpecPayload;
  lockedByName: string | null;
  lockedAt: string | null;
};

export async function lockedSpecOptions(): Promise<LockedSpecOption[]> {
  await ensureDb();
  const { rows } = await db().query<LockedSpecOption>(`
    select s.id as "skuId", s.code, s.name, s.gtin, e.name as entity,
           v.id as "specId", v.version
      from skus s
      join entities e on e.id = s.entity_id
      join lateral (
        select * from spec_versions
         where sku_id = s.id and locked_at is not null
         order by version desc limit 1
      ) v on true
     order by e.name, s.code
  `);
  return rows;
}

export async function lockedSpecFor(skuId: string): Promise<LockedSpec | null> {
  await ensureDb();
  if (!isUuid(skuId)) return null;
  const { rows } = await db().query<
    LockedSpecOption & {
      payload: SpecPayload;
      locked_by_name: string | null;
      locked_at: string | null;
    }
  >(
    `select s.id as "skuId", s.code, s.name, s.gtin, e.name as entity,
            v.id as "specId", v.version, v.approved_copy as payload,
            u.name as locked_by_name, v.locked_at
       from skus s
       join entities e on e.id = s.entity_id
       join lateral (
         select * from spec_versions
          where sku_id = s.id and locked_at is not null
          order by version desc limit 1
       ) v on true
       left join users u on u.id = v.locked_by
      where s.id = $1`,
    [skuId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    skuId: row.skuId,
    code: row.code,
    name: row.name,
    gtin: row.gtin,
    entity: row.entity,
    specId: row.specId,
    version: row.version,
    payload: row.payload,
    lockedByName: row.locked_by_name,
    lockedAt: row.locked_at,
  };
}

async function vendorIdFor(name: string, contact?: string): Promise<string> {
  const clean = name.trim();
  const found = await db().query<{ id: string }>(
    "select id from vendors where lower(name) = lower($1) limit 1",
    [clean],
  );
  if (found.rows[0]) {
    if (contact?.trim()) {
      await db().query("update vendors set contact_name = $2 where id = $1", [
        found.rows[0].id,
        contact.trim(),
      ]);
    }
    return found.rows[0].id;
  }
  const ins = await db().query<{ id: string }>(
    `insert into vendors (name, kind, contact_name) values ($1, 'printer', $2) returning id`,
    [clean, contact?.trim() || null],
  );
  return ins.rows[0].id;
}

export async function createProof(
  user: SessionUser,
  skuId: string,
  input: ProofInput,
): Promise<{ proofId: string; checkId: string; verdict: Verdict }> {
  await ensureDb();
  const spec = await lockedSpecFor(skuId);
  if (!spec) throw new Error("That SKU has no locked spec — lock a spec version first.");

  // The artifact is the submission itself: canonical, hashed, immutable.
  // Same submission again = same proof, new check run.
  const canonical = JSON.stringify({
    sku: skuId,
    vendor: input.vendor.trim(),
    contact: (input.contact ?? "").trim(),
    version: input.proofVersion,
    gtin: (input.gtin ?? "").trim(),
    trimW: (input.trimW ?? "").trim(),
    trimH: (input.trimH ?? "").trim(),
    dieline: (input.dieline ?? "").trim(),
    spotColors: input.spotColors.map((s) => s.trim()).filter(Boolean),
    panels: input.panels.map((p) => ({ panel: p.panel, text: p.text.trim() })),
  });
  const sha = createHash("sha256").update(canonical).digest("hex");
  const vendorId = await vendorIdFor(input.vendor, input.contact);
  const filename =
    input.fileName?.trim() || `${spec.code}_proof_v${input.proofVersion}.txt`;
  const pages = Math.max(1, input.panels.filter((p) => p.text.trim()).length);

  const existing = await db().query<{ id: string }>(
    `select id from proofs where sku_id = $1 and direction = 'inbound' and sha256 = $2`,
    [skuId, sha],
  );
  let proofId = existing.rows[0]?.id;
  if (!proofId) {
    const ins = await db().query<{ id: string }>(
      `insert into proofs (sku_id, vendor_id, direction, version, filename, storage_key, sha256, pages, created_by)
       values ($1, $2, 'inbound', $3, $4, $5, $6, $7, $8) returning id`,
      [skuId, vendorId, input.proofVersion, filename, `entered:${sha}`, sha, pages, user.id],
    );
    proofId = ins.rows[0].id;
  }

  const started = Date.now();
  const result = checkProof(spec.payload, spec.gtin, input);
  const duration = Math.max(1, Date.now() - started);

  const run = await db().query<{ id: string }>(
    `insert into check_runs (proof_id, spec_version_id, engine_version, verdict, duration_ms)
     values ($1, $2, $3, $4, $5) returning id`,
    [proofId, spec.specId, result.engine, result.verdict, duration],
  );
  const checkId = run.rows[0].id;

  for (const f of result.findings) {
    await db().query(
      `insert into findings (check_run_id, code, severity, sheet, title, expected, actual, detail, confidence, bbox)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, null)`,
      [checkId, f.code, f.severity, f.sheet, f.title, f.expected, f.actual, f.detail, (f.confidence / 100).toFixed(3)],
    );
  }

  await db().query(
    `insert into audit_log (user_id, action, subject, meta) values ($1, 'proof_check', $2, $3)`,
    [
      user.id,
      `proof:${proofId}`,
      JSON.stringify({
        sku: spec.code,
        vendor: input.vendor.trim(),
        spec_version: spec.version,
        verdict: result.verdict,
        blockers: result.blockers,
        warnings: result.warnings,
        notes: result.notes,
        engine: result.engine,
        sha256: sha,
      }),
    ],
  );

  return { proofId, checkId, verdict: result.verdict };
}

export type ProofListItem = {
  id: string;
  version: number;
  filename: string;
  received_at: string;
  code: string;
  sku_name: string;
  entity: string;
  vendor: string;
  verdict: Verdict | null;
  checked_at: string | null;
  spec_version: number | null;
  duration_ms: number | null;
  blockers: number;
  warnings: number;
  notes: number;
  decision: "approved" | "held" | null;
  decision_at: string | null;
  decision_by: string | null;
};

export async function listProofs(): Promise<ProofListItem[]> {
  await ensureDb();
  const { rows } = await db().query<ProofListItem>(`
    select p.id, p.version, p.filename, p.received_at,
           s.code, s.name as sku_name, e.name as entity,
           coalesce(v.name, '—') as vendor,
           cr.verdict, cr.created_at as checked_at, cr.duration_ms,
           sv.version as spec_version,
           coalesce((select count(*) from findings f where f.check_run_id = cr.id and f.severity = 'blocker'), 0)::int as blockers,
           coalesce((select count(*) from findings f where f.check_run_id = cr.id and f.severity = 'warning'), 0)::int as warnings,
           coalesce((select count(*) from findings f where f.check_run_id = cr.id and f.severity = 'note'), 0)::int as notes,
           ap.decision, ap.at as decision_at, ap.by_name as decision_by
      from proofs p
      join skus s on s.id = p.sku_id
      join entities e on e.id = s.entity_id
      left join vendors v on v.id = p.vendor_id
      left join lateral (
        select * from check_runs where proof_id = p.id order by created_at desc limit 1
      ) cr on true
      left join spec_versions sv on sv.id = cr.spec_version_id
      left join lateral (
        select a.decision, a.at, u.name as by_name
          from approvals a join users u on u.id = a.user_id
         where a.proof_id = p.id order by a.at desc limit 1
      ) ap on true
     order by p.received_at desc
     limit 100
  `);
  return rows;
}

export type ProofDetail = {
  id: string;
  version: number;
  filename: string;
  sha256: string;
  received_at: string;
  created_by_name: string | null;
  sku: { id: string; code: string; name: string; gtin: string | null; entity: string };
  vendor: string;
  contact: string | null;
  spec: {
    id: string;
    version: number;
    locked_by_name: string | null;
    locked_at: string | null;
  } | null;
  run: {
    id: string;
    verdict: Verdict;
    engine: string;
    duration_ms: number | null;
    created_at: string;
  } | null;
  findings: CheckFinding[];
  approval: {
    decision: "approved" | "held";
    note: string | null;
    at: string;
    by_name: string;
  } | null;
};

export async function getProof(id: string): Promise<ProofDetail | null> {
  await ensureDb();
  if (!isUuid(id)) return null;
  const { rows } = await db().query<
    Omit<ProofDetail, "sku" | "spec" | "run" | "findings" | "approval"> & {
      sku_id: string;
      code: string;
      sku_name: string;
      gtin: string | null;
      entity: string;
    }
  >(
    `select p.id, p.version, p.filename, p.sha256, p.received_at,
            u.name as created_by_name,
            p.sku_id, s.code, s.name as sku_name, s.gtin, e.name as entity,
            coalesce(v.name, '—') as vendor, v.contact_name as contact
       from proofs p
       join skus s on s.id = p.sku_id
       join entities e on e.id = s.entity_id
       left join vendors v on v.id = p.vendor_id
       left join users u on u.id = p.created_by
      where p.id = $1`,
    [id],
  );
  const p = rows[0];
  if (!p) return null;

  const runRes = await db().query<ProofDetail["run"] & { spec_version_id: string; version: number; locked_by_name: string | null; locked_at: string | null }>(
    `select cr.id, cr.verdict, cr.engine_version as engine, cr.duration_ms, cr.created_at,
            sv.id as spec_version_id, sv.version, u.name as locked_by_name, sv.locked_at
       from check_runs cr
       join spec_versions sv on sv.id = cr.spec_version_id
       left join users u on u.id = sv.locked_by
      where cr.proof_id = $1
      order by cr.created_at desc
      limit 1`,
    [id],
  );
  const run = runRes.rows[0] ?? null;

  let findings: CheckFinding[] = [];
  if (run) {
    const f = await db().query<CheckFinding & { confidence: number }>(
      `select code, severity, sheet, title, expected, actual, detail,
              (confidence * 100)::float8 as confidence
         from findings
        where check_run_id = $1
        order by case severity when 'blocker' then 0 when 'warning' then 1 else 2 end, code`,
      [run.id],
    );
    findings = f.rows;
  }

  const appr = await db().query<NonNullable<ProofDetail["approval"]>>(
    `select a.decision, a.note, a.at, u.name as by_name
       from approvals a join users u on u.id = a.user_id
      where a.proof_id = $1 order by a.at desc limit 1`,
    [id],
  );

  return {
    id: p.id,
    version: p.version,
    filename: p.filename,
    sha256: p.sha256,
    received_at: p.received_at,
    created_by_name: p.created_by_name,
    sku: { id: p.sku_id, code: p.code, name: p.sku_name, gtin: p.gtin, entity: p.entity },
    vendor: p.vendor,
    contact: p.contact,
    spec: run
      ? {
          id: run.spec_version_id,
          version: run.version,
          locked_by_name: run.locked_by_name,
          locked_at: run.locked_at,
        }
      : null,
    run: run
      ? {
          id: run.id,
          verdict: run.verdict,
          engine: run.engine,
          duration_ms: run.duration_ms,
          created_at: run.created_at,
        }
      : null,
    findings,
    approval: appr.rows[0] ?? null,
  };
}

export async function decideProof(
  user: SessionUser,
  proofId: string,
  decision: "approved" | "held",
  note: string,
): Promise<void> {
  await ensureDb();
  if (!isUuid(proofId)) throw new Error("Proof not found.");
  const proof = await db().query<{
    sha256: string;
    version: number;
    code: string;
    vendor: string;
    spec_version: number | null;
  }>(
    `select p.sha256, p.version, s.code, coalesce(v.name, '—') as vendor,
            (select sv.version
               from check_runs cr join spec_versions sv on sv.id = cr.spec_version_id
              where cr.proof_id = p.id order by cr.created_at desc limit 1) as spec_version
       from proofs p
       join skus s on s.id = p.sku_id
       left join vendors v on v.id = p.vendor_id
      where p.id = $1`,
    [proofId],
  );
  if (!proof.rows[0]) throw new Error("Proof not found.");
  const run = await db().query<{ id: string }>(
    "select id from check_runs where proof_id = $1 order by created_at desc limit 1",
    [proofId],
  );

  const p = proof.rows[0];
  await db().query(
    `insert into approvals (proof_id, check_run_id, user_id, decision, proof_sha256, note)
     values ($1, $2, $3, $4, $5, $6)`,
    [proofId, run.rows[0]?.id ?? null, user.id, decision, p.sha256, note.trim() || null],
  );
  await db().query(
    `insert into audit_log (user_id, action, subject, meta) values ($1, $2, $3, $4)`,
    [
      user.id,
      decision === "approved" ? "proof_approve" : "proof_hold",
      `proof:${proofId}`,
      JSON.stringify({
        sku: p.code,
        proof_version: p.version,
        vendor: p.vendor,
        spec_version: p.spec_version,
        sha256: p.sha256,
        note: note.trim() || null,
      }),
    ],
  );
}
