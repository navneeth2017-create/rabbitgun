import { NextResponse } from "next/server";
import { authEnabled, login } from "@/lib/session";

export async function POST(req: Request) {
  if (!authEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Auth is off — no DATABASE_URL configured." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Pick a person and enter the password." }, { status: 400 });
  }

  const user = await login(email, password).catch(() => null);
  if (!user) {
    return NextResponse.json({ ok: false, error: "No match. Wrong name or password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, name: user.name });
}
