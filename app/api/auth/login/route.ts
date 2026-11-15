import { NextResponse } from "next/server";
import { authEnabled, login } from "@/lib/session";

/**
 * A small brake on password guessing. In memory, per server instance — the
 * gate has exactly three humans, so anything more elaborate belongs behind
 * a proxy. Keyed by person + caller so one noisy IP can't lock a person out.
 */
const tries = new Map<string, { n: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 8;

function limited(key: string): boolean {
  const e = tries.get(key);
  return Boolean(e && Date.now() <= e.resetAt && e.n >= MAX_TRIES);
}

function noteFail(key: string) {
  const now = Date.now();
  const e = tries.get(key);
  if (!e || now > e.resetAt) tries.set(key, { n: 1, resetAt: now + WINDOW_MS });
  else e.n += 1;
}

export async function POST(req: Request) {
  if (!authEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Auth is off — no DATABASE_URL configured." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  const user = typeof body?.user === "string" ? body.user : typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!user || !password) {
    return NextResponse.json({ ok: false, error: "Pick a person and enter the password." }, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const key = `${user.trim().toLowerCase()}|${ip}`;
  if (limited(key)) {
    return NextResponse.json(
      { ok: false, error: "Too many tries. Wait a few minutes." },
      { status: 429 },
    );
  }

  const session = await login(user, password).catch(() => null);
  if (!session) {
    noteFail(key);
    return NextResponse.json({ ok: false, error: "No match. Wrong person or password." }, { status: 401 });
  }

  tries.delete(key);
  return NextResponse.json({ ok: true, name: session.name });
}
