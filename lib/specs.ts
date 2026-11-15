import { db } from "@/lib/db";
import { ensureDb } from "@/lib/bootstrap";
import type { SessionUser } from "@/lib/session";

/**
 * Specs are the locked truth the PackCheck gate verifies against.
 * Rule: a spec version is never edited — saving always creates a new
 * version that supersedes the old one, and locking is recorded in the
 * audit log with who + when.
 */

export type CopyBlock = { panel: string; text: string };
export type Claim = { claim: string; source: string };
export type Dims = {
  trimW?: string;
  trimH?: string;
  bleed?: string;
  safe?: string;
  dieline?: string;
};

export type SpecPayload = {
  blocks: CopyBlock[];
  claims: Claim[];
  dims: Dims;
  requiredText: string[];
  spotColors: string[];
};

export type SpecVersion = {
  id: string;
  sku_id: string;
  version: number;
  approved_copy: SpecPayload;
  locked_by_name: string | null;
  locked_at: string | null;
  created_at: string;
  supersedes: string | null;
};

export type Sku = {
  id: string;
  entity_id: string;
  entity: string;
  code: string;
  name: string;
  gtin: string | null;
};

export type SpecListItem = Sku & {
  spec_id: string | null;
  version: number | null;
  locked: boolean;
  versions: number;
  created_at: string | null;
};

export async function listSpecs(): Promise<SpecListItem[]> {
  await ensureDb();
  const { rows } = await db().query<SpecListItem>(`
    select s.id, s.entity_id, s.code, s.name, s.gtin, e.name as entity,
           latest.id as spec_id, latest.version,
           (latest.locked_at is not null) as locked,
           latest.created_at,
           (select count(*) from spec_versions v where v.sku_id = s.id)::int as versions
      from skus s
      join entities e on e.id = s.entity_id
      left join lateral (
        select * from spec_versions v where v.sku_id = s.id order by version desc limit 1
      ) latest on true
     order by e.name, s.code
  `);
  return rows;
}

export async function getSku(
  id: string,
): Promise<{ sku: Sku; versions: SpecVersion[] } | null> {
  await ensureDb();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const skuRes = await db().query<Sku>(
    `select s.id, s.entity_id, s.code, s.name, s.gtin, e.name as entity
       from skus s join entities e on e.id = s.entity_id where s.id = $1`,
    [id],
  );
  if (!skuRes.rows[0]) return null;
  const versions = await db().query<SpecVersion>(
    `select v.id, v.sku_id, v.version, v.approved_copy,
            u.name as locked_by_name, v.locked_at, v.created_at, v.supersedes
       from spec_versions v left join users u on u.id = v.locked_by
      where v.sku_id = $1 order by v.version desc`,
    [id],
  );
  return { sku: skuRes.rows[0], versions: versions.rows };
}

export async function createSku(
  entityId: string,
  code: string,
  name: string,
  gtin: string,
): Promise<string> {
  await ensureDb();
  const { rows } = await db().query<{ id: string }>(
    `insert into skus (entity_id, code, name, gtin) values ($1, $2, $3, nullif($4,'')) returning id`,
    [entityId, code.trim().toUpperCase(), name.trim(), gtin.trim()],
  );
  return rows[0].id;
}

export async function saveSpec(
  skuId: string,
  payload: SpecPayload,
  user: SessionUser,
): Promise<{ version: number }> {
  await ensureDb();
  const clean: SpecPayload = {
    blocks: payload.blocks.filter((b) => b.text.trim() !== ""),
    claims: payload.claims.filter((c) => c.claim.trim() !== ""),
    dims: payload.dims ?? {},
    requiredText: payload.requiredText.filter((t) => t.trim() !== ""),
    spotColors: payload.spotColors.filter((t) => t.trim() !== ""),
  };
  const latest = await db().query<{ max: number; id: string | null }>(
    `select coalesce(max(version), 0)::int as max,
            (array_agg(id order by version desc))[1] as id
       from spec_versions where sku_id = $1`,
    [skuId],
  );
  const sku = await db().query<{ code: string }>("select code from skus where id = $1", [skuId]);
  const next = latest.rows[0].max + 1;
  await db().query(
    `insert into spec_versions (sku_id, version, approved_copy, dims, required_text, spot_colors, supersedes)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      skuId,
      next,
      JSON.stringify(clean),
      JSON.stringify(clean.dims),
      clean.requiredText,
      clean.spotColors,
      latest.rows[0].id,
    ],
  );
  await db().query(
    `insert into audit_log (user_id, action, subject, meta) values ($1, 'spec_save', $2, $3)`,
    [user.id, `sku:${skuId}`, JSON.stringify({ version: next, sku: sku.rows[0]?.code ?? null })],
  );
  return { version: next };
}

export async function lockSpec(
  specId: string,
  user: SessionUser,
): Promise<{ skuId: string; version: number } | null> {
  await ensureDb();
  const { rows } = await db().query<{ sku_id: string; version: number }>(
    `update spec_versions set locked_by = $2, locked_at = now()
      where id = $1 and locked_at is null
      returning sku_id, version`,
    [specId, user.id],
  );
  if (!rows[0]) return null;
  const sku = await db().query<{ code: string }>("select code from skus where id = $1", [
    rows[0].sku_id,
  ]);
  await db().query(
    `insert into audit_log (user_id, action, subject, meta) values ($1, 'spec_lock', $2, $3)`,
    [
      user.id,
      `spec:${specId}`,
      JSON.stringify({ version: rows[0].version, sku: sku.rows[0]?.code ?? null }),
    ],
  );
  return { skuId: rows[0].sku_id, version: rows[0].version };
}
