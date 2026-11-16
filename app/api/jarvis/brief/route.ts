import { NextResponse } from "next/server";
import { proofs as demoProofs } from "@/lib/demo";
import { hasDatabase } from "@/lib/db";
import { listProofs } from "@/lib/proofs";
import { cash, entities, leakTotal, portfolio } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

/**
 * Read-only feed for Jarvis, the same shape monarch-backend already gives it.
 * Jarvis never writes here. Bearer token only, no session cookie.
 *
 * PackCheck is live when Postgres is connected — the counts Jarvis speaks are
 * the real ones. Portfolio numbers are still sample data until the connectors
 * land, and `data.portfolio` says so, so Jarvis can caveat instead of lying.
 */
export async function GET(request: Request) {
  const expected = process.env.RABBITGUN_FEED_TOKEN;
  const auth = request.headers.get("authorization") ?? "";

  if (expected) {
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "RABBITGUN_FEED_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const live = hasDatabase();
  let packcheck: Array<{
    id: string;
    sku: string;
    product: string;
    vendor: string;
    verdict: string | null;
    proof_version: number;
    spec_version: number | null;
    blockers: number;
    warnings: number;
    decision: "approved" | "held" | null;
    href: string;
  }>;

  if (live) {
    try {
      const rows = await listProofs();
      packcheck = rows.map((p) => ({
        id: p.id,
        sku: p.code,
        product: p.sku_name,
        vendor: p.vendor,
        verdict: p.verdict,
        proof_version: p.version,
        spec_version: p.spec_version,
        blockers: p.blockers,
        warnings: p.warnings,
        decision: p.decision,
        href: `/packcheck/${p.id}`,
      }));
    } catch (err) {
      return NextResponse.json(
        { error: "packcheck feed unavailable", detail: (err as Error).message },
        { status: 503 },
      );
    }
  } else {
    const versionNumber = (v: string) => Number(String(v).replace(/[^0-9]/g, "")) || 0;
    packcheck = demoProofs.map((p) => ({
      id: p.id,
      sku: p.sku,
      product: p.product,
      vendor: p.vendor,
      verdict: p.verdict,
      proof_version: versionNumber(p.proofVersion),
      spec_version: p.specVersion ? versionNumber(p.specVersion) : null,
      blockers: p.findings.filter((f) => f.severity === "blocker").length,
      warnings: p.findings.filter((f) => f.severity === "warning").length,
      decision: null,
      href: `/packcheck/${p.id}`,
    }));
  }

  const holds = packcheck.filter((p) => p.verdict === "HOLD");
  const blockers = holds.reduce((a, p) => a + p.blockers, 0);
  const awaiting = packcheck.filter((p) => !p.decision).length;

  const say = live
    ? packcheck.length === 0
      ? "PackCheck is armed but nothing has been checked yet — no locked spec, no proofs."
      : holds.length > 0
        ? `${holds.length} proof${holds.length === 1 ? "" : "s"} on hold with ${blockers} blocker${blockers === 1 ? "" : "s"}${awaiting ? `; ${awaiting} awaiting a decision` : ""}.`
        : `Nothing on hold${awaiting ? `; ${awaiting} awaiting a decision` : ""}.`
    : holds.length > 0
      ? `${holds.length} proof on hold with ${blockers} blockers. ${cash.runwayDays} days of cash. ${leakTotal} a month leaking.`
      : `Nothing on hold. ${cash.runwayDays} days of cash.`;

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    data: { packcheck: live ? "live" : "sample", portfolio: "sample" },
    say,
    portfolio: {
      revenue_mtd: portfolio.revenue,
      kept_mtd: portfolio.net,
      cash_on_hand: cash.onHand,
      orders: portfolio.orders,
      ship_today: portfolio.shipToday,
      exceptions: portfolio.exceptions,
      leaking_monthly: leakTotal,
    },
    entities: entities.map((e) => ({
      id: e.id,
      name: e.name,
      kind: e.kind,
      revenue_mtd: e.revenue,
      delta_pct: e.delta,
      orders: e.orders,
      net: e.net,
      cash: e.cash,
      ship_today: e.shipToday,
      exceptions: e.exceptions,
    })),
    packcheck,
    counts: {
      proofs: packcheck.length,
      awaiting_decision: awaiting,
      blockers_open: blockers,
    },
    links: {
      brief: "/",
      packcheck: "/packcheck",
      specs: "/specs",
      money: "/money",
      freight: "/freight",
      vault: "/vault",
      brain: "/brain",
    },
  });
}
