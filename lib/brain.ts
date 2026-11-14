import { db } from "@/lib/db";
import { ensureDb } from "@/lib/bootstrap";
import { embed } from "@/lib/embed";
import { knowledgeBase } from "@/lib/knowledge";

/**
 * The Brain's memory. On first use the knowledge base is embedded locally
 * (MiniLM on this box) and stored in pgvector. Search = embed the question,
 * nearest neighbors, cited. If embeddings can't run, fall back to text
 * matching so the brain still answers.
 */

let seeded = false;

export async function ensureKnowledge(): Promise<void> {
  await ensureDb();
  if (seeded) return;

  const { rows } = await db().query<{ n: number }>(
    "select count(*)::int as n from knowledge",
  );
  if (rows[0].n === 0) {
    let ok = 0;
    for (const entry of knowledgeBase) {
      try {
        const vec = await embed(entry.text);
        await db().query(
          `insert into knowledge (source, title, chunk, tags, embedding)
           values ($1, $2, $3, $4, $5)`,
          [entry.source, entry.title, entry.text, entry.tags, `[${vec.join(",")}]`],
        );
        ok++;
      } catch (err) {
        console.warn("[brain] embedding failed, leaving entry out:", (err as Error).message);
      }
    }
    if (ok === 0) {
      console.warn("[brain] knowledge base could not be embedded (no local model?) — search falls back to text matching");
      seeded = true; // don't retry every request
      return;
    }
    console.log(`[brain] trained: ${ok}/${knowledgeBase.length} knowledge entries embedded`);
  }
  seeded = true;
}

export type BrainHit = {
  source: string;
  title: string;
  text: string;
  tags: string[];
  score: number;
};

export async function searchKnowledge(query: string): Promise<BrainHit[]> {
  await ensureKnowledge();
  const q = query.trim();
  if (!q) return [];

  try {
    const vec = await embed(q);
    const { rows } = await db().query<BrainHit>(
      `select source, title, chunk as text, tags,
              1 - (embedding <=> $1::vector) as score
         from knowledge
        order by embedding <=> $1::vector
        limit 8`,
      [`[${vec.join(",")}]`],
    );
    return rows.filter((r) => r.score > 0.25);
  } catch {
    // No local embeddings (model not downloaded / no network) — text fallback.
    const { rows } = await db().query<BrainHit>(
      `select source, title, chunk as text, tags, 0::float8 as score
         from knowledge
        where chunk ilike '%' || $1 || '%' or title ilike '%' || $1 || '%'
        order by id
        limit 8`,
      [q.replace(/[%_]/g, "")],
    );
    return rows;
  }
}
