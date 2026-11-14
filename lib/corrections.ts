import { db } from "@/lib/db";
import { ensureDb } from "@/lib/bootstrap";
import { embed } from "@/lib/embed";
import type { SessionUser } from "@/lib/session";

/**
 * The self-improving loop. When someone corrects the AI ("hey, that's
 * wrong — it's so-and-so"), the correction is recorded and immediately
 * embedded as a knowledge entry at 1.5× weight, so the corrected answer
 * beats the stale one in retrieval. A human said it, so it's not an AI
 * proposal — it goes straight in, with a receipt in the audit log.
 */

export type Correction = {
  id: string;
  user_id: string | null;
  user_name?: string | null;
  hit_title: string;
  hit_source: string | null;
  corrected_text: string;
  created_at: string;
};

export async function saveCorrection(
  user: SessionUser,
  hitTitle: string,
  hitSource: string,
  correctedText: string,
): Promise<void> {
  await ensureDb();

  const { rows } = await db().query<{ id: string }>(
    `insert into corrections (user_id, hit_title, hit_source, corrected_text)
     values ($1, $2, $3, $4) returning id`,
    [user.id, hitTitle.trim(), hitSource, correctedText.trim()],
  );

  // The correction becomes knowledge immediately, and it outweighs the
  // entry it fixed. Same question → corrected answer, from now on.
  // If the embedding step can't run (no local model), the correction is
  // still recorded — it just stays un-applied until the brain can take it.
  try {
    const vec = await embed(correctedText);
    await db().query(
      `insert into knowledge (source, title, chunk, tags, embedding, weight)
       values ($1, $2, $3, $4, $5, 1.5)`,
      [
        "correction",
        `Correction — ${hitTitle.trim()}`,
        correctedText.trim(),
        ["correction", hitSource].filter(Boolean),
        `[${vec.join(",")}]`,
      ],
    );
    await db().query(
      `update corrections set applied_at = now() where id = $1`,
      [rows[0].id],
    );
  } catch (err) {
    console.warn("[corrections] recorded but not yet embedded:", (err as Error).message);
  }

  await db().query(
    `insert into audit_log (user_id, action, subject, meta) values ($1, 'correction', $2, $3)`,
    [user.id, `knowledge:${rows[0].id}`, JSON.stringify({ hit: hitTitle.trim() })],
  );
}

/** Owner view — every correction ever made, newest first. */
export async function recentCorrections(): Promise<Correction[]> {
  await ensureDb();
  const { rows } = await db().query<Correction>(
    `select c.id, c.user_id, u.name as user_name, c.hit_title, c.hit_source,
            c.corrected_text, c.created_at
       from corrections c left join users u on u.id = c.user_id
      order by c.created_at desc limit 50`,
  );
  return rows;
}
