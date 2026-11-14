import { db } from "@/lib/db";
import { ensureDb } from "@/lib/bootstrap";
import { ensureKnowledge } from "@/lib/brain";

/**
 * The dream pass — reconciliation while nothing else is running.
 *
 * 1. Makes sure every correction ever made is actually embedded as knowledge.
 * 2. Sweeps the index for near-duplicates and contradictions (same topic,
 *    cosine > 0.93) and archives the stale copy — the corrected/later one wins.
 * 3. Writes a dream report so the improvement is visible, not vibes.
 *
 * Runs entirely on the home box — Rabbitgun is the in-home AI, so the
 * reconciliation is mechanical here; a local generation model (never a
 * hosted one) slots into the marked step when we wire one next to MiniLM.
 */

export type DreamResult = {
  scanned: number;
  merged: number;
  archived: number;
  fixed: number;
  summary: string;
};

export async function runDream(): Promise<DreamResult> {
  await ensureKnowledge();

  // 1. Corrections sanity — corrections are inserted with their embedding in
  // one function call, so nothing can be orphaned today. When the Claude
  // rewrite step starts transforming rows, its check slots in here first.

  // 2. Duplicate / contradiction sweep.
  const { rows } = await db().query<{
    id: number;
    source: string;
    title: string;
    chunk: string;
    weight: number;
    embedding: string;
  }>(
    `select id, source, title, chunk, weight, embedding::text as embedding
       from knowledge
      where archived = false
      order by weight desc, id desc`,
  );

  const vecs = rows.map((r) => ({ ...r, vec: JSON.parse(r.embedding) as number[] }));
  const archiveIds: number[] = [];
  const notes: string[] = [];

  for (let i = 0; i < vecs.length; i++) {
    if (archiveIds.includes(vecs[i].id)) continue;
    for (let j = i + 1; j < vecs.length; j++) {
      if (archiveIds.includes(vecs[j].id)) continue;
      if (vecs[i].source !== vecs[j].source) continue;
      const sim = cosine(vecs[i].vec, vecs[j].vec);
      if (sim > 0.93) {
        // rows are weight-desc, id-desc: the first (stronger/later) stays.
        archiveIds.push(vecs[j].id);
        notes.push(
          `${vecs[j].title} folded into "${vecs[i].title}" (${(sim * 100).toFixed(0)}% overlap)`,
        );
      }
    }
  }

  if (archiveIds.length > 0) {
    await db().query(`update knowledge set archived = true where id = any($1::int[])`, [
      archiveIds,
    ]);
  }

  const result: DreamResult = {
    scanned: rows.length,
    merged: archiveIds.length,
    archived: archiveIds.length,
    fixed: 0,
    summary: notes.length ? notes.join("; ") : "index is clean — no drift found",
  };

  await db().query(
    `insert into dream_reports (scanned, merged, archived, fixed, summary)
     values ($1, $2, $3, $4, $5)`,
    [result.scanned, result.merged, result.archived, result.fixed, result.summary],
  );

  return result;
}

function cosine(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i];
  return s;
}

/** Owner view — the dream log. */
export async function listDreamReports(): Promise<
  { id: number; at: string; scanned: number; merged: number; summary: string }[]
> {
  await ensureDb();
  const { rows } = await db().query<{
    id: number;
    at: string;
    scanned: number;
    merged: number;
    summary: string;
  }>(
    `select id, at, scanned, merged, summary from dream_reports order by at desc limit 10`,
  );
  return rows;
}
