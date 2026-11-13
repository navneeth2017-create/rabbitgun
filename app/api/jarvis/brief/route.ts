import { NextResponse } from "next/server";
import { proofs } from "@/lib/demo";
import { cash, entities, leakTotal, portfolio } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

/**
 * Read-only feed for Jarvis, the same shape monarch-backend already gives it.
 * Jarvis never writes here. Bearer token only, no session cookie.
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

  const holds = proofs.filter((p) => p.verdict === "HOLD");
  const blockers = holds.reduce(
    (a, p) => a + p.findings.filter((f) => f.severity === "blocker").length,
    0,
  );

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    say:
      holds.length > 0
        ? `${holds.length} proof on hold with ${blockers} blockers. ${cash.runwayDays} days of cash. ${leakTotal} a month leaking.`
        : `Nothing on hold. ${cash.runwayDays} days of cash.`,
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
    packcheck: proofs.map((p) => ({
      id: p.id,
      sku: p.sku,
      product: p.product,
      vendor: p.vendor,
      verdict: p.verdict,
      proof_version: p.proofVersion,
      spec_version: p.specVersion,
      blockers: p.findings.filter((f) => f.severity === "blocker").length,
      warnings: p.findings.filter((f) => f.severity === "warning").length,
      href: `/packcheck/${p.id}`,
    })),
    links: {
      brief: "/",
      packcheck: "/packcheck",
      money: "/money",
      freight: "/freight",
      vault: "/vault",
      brain: "/brain",
    },
  });
}
