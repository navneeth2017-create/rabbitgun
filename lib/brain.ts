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

  try {
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
      } else {
        console.log(`[brain] trained: ${ok}/${knowledgeBase.length} knowledge entries embedded`);
      }
    }
  } catch (err) {
    console.warn("[brain] knowledge index unavailable:", (err as Error).message);
  }
  seeded = true; // never block the dashboard on the brain
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
    const { rows } = await db().query<{ source: string; title: string; text: string; tags: string[]; raw: number; weight: number }>(
      `select source, title, chunk as text, tags,
              1 - (embedding <=> $1::vector) as raw,
              weight
         from knowledge
        where archived = false
        order by embedding <=> $1::vector
        limit 8`,
      [`[${vec.join(",")}]`],
    );
    // Corrections carry extra weight — the fix outranks the fact it fixed.
    return rows
      .map((r) => ({ source: r.source, title: r.title, text: r.text, tags: r.tags, score: r.raw * r.weight }))
      .filter((r) => r.score > 0.25);
  } catch {
    // No pgvector or no local model — text fallback, and never break the page.
    try {
      const { rows } = await db().query<BrainHit>(
        `select source, title, chunk as text, tags, 0::float8 as score
           from knowledge
          where archived = false
            and (chunk ilike '%' || $1 || '%' or title ilike '%' || $1 || '%')
          order by weight desc, id
          limit 8`,
        [q.replace(/[%_]/g, "")],
      );
      return rows;
    } catch {
      return [];
    }
  }
}
