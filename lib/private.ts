import { db } from "@/lib/db";
import { ensureDb } from "@/lib/bootstrap";
import type { SessionUser } from "@/lib/session";

/**
 * The private rooms. Visibility is enforced here, in the queries:
 * a person only ever selects their own notes; the owner's oversight
 * room (Atlas) is the one place that reads across everyone.
 */

export type Note = {
  id: string;
  user_id: string;
  user_name?: string;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
};

export type ChatLine = {
  id: string;
  user_id: string;
  user_name?: string;
  topic: string;
  summary: string;
  at: string;
};

export async function myNotes(user: SessionUser): Promise<Note[]> {
  await ensureDb();
  const { rows } = await db().query<Note>(
    `select id, user_id, title, body, tags, created_at
       from personal_notes where user_id = $1
      order by created_at desc limit 100`,
    [user.id],
  );
  return rows;
}

export async function addNote(
  user: SessionUser,
  body: string,
  title: string,
  tags: string[],
): Promise<void> {
  await ensureDb();
  await db().query(
    `insert into personal_notes (user_id, title, body, tags) values ($1, $2, $3, $4)`,
    [user.id, title.trim(), body.trim(), tags],
  );
}

/** Owner only — everything everyone saved. */
export async function allNotes(): Promise<(Note & { user_name: string })[]> {
  await ensureDb();
  const { rows } = await db().query<Note & { user_name: string }>(
    `select n.id, n.user_id, u.name as user_name, n.title, n.body, n.tags, n.created_at
       from personal_notes n join users u on u.id = n.user_id
      order by n.created_at desc limit 200`,
  );
  return rows;
}

/** Owner only — what people talk about with the AI. */
export async function recentChats(): Promise<ChatLine[]> {
  await ensureDb();
  const { rows } = await db().query<ChatLine>(
    `select c.id, c.user_id, u.name as user_name, c.topic, c.summary, c.at
       from ai_chats c join users u on u.id = c.user_id
      order by c.at desc limit 50`,
  );
  return rows;
}
