import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db, hasDatabase } from "@/lib/db";
import { ensureDb } from "@/lib/bootstrap";

export const SESSION_COOKIE = "rg_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "member" | "viewer";
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Auth is ON only when a database exists. No DATABASE_URL → preview mode:
 * sample data, no login, like the demo. Railway gets the real gate.
 */
export const authEnabled = hasDatabase;

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!authEnabled()) return null;
  await ensureDb();
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { rows } = await db().query<
    { id: string; email: string; name: string; role: SessionUser["role"] } & {
      expires_at: Date;
    }
  >(
    `select u.id, u.email, u.name, u.role, s.expires_at
       from sessions s join users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now()`,
    [hashToken(token)],
  );
  return rows[0] ?? null;
}

export async function login(handle: string, password: string): Promise<SessionUser | null> {
  await ensureDb();
  // Log in with a plain username ("nav") — or accept a full email if ever needed.
  const h = handle.trim().toLowerCase();
  const email = h.includes("@") ? h : `${h}@rabbitgun.internal`;
  const { rows } = await db().query<{
    id: string;
    email: string;
    name: string;
    role: SessionUser["role"];
    password_hash: string;
  }>("select id, email, name, role, password_hash from users where lower(email) = $1", [
    email.trim().toLowerCase(),
  ]);
  const user = rows[0];
  if (!user) return null;

  const bcrypt = await import("bcryptjs");
  if (!bcrypt.compareSync(password, user.password_hash)) return null;

  const token = randomBytes(32).toString("base64url");
  await db().query(
    `insert into sessions (user_id, token_hash, expires_at)
     values ($1, $2, now() + interval '${SESSION_DAYS} days')`,
    [user.id, hashToken(token)],
  );
  await db().query("update users set last_seen_at = now() where id = $1", [user.id]);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && authEnabled()) {
    await db().query("delete from sessions where token_hash = $1", [hashToken(token)]);
  }
  jar.delete(SESSION_COOKIE);
}
