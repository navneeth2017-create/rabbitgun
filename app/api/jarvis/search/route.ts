import { NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/brain";

export const dynamic = "force-dynamic";

/**
 * The trained brain, over the API. Jarvis asks a question in plain words,
 * Rabbitgun embeds it locally and returns the nearest knowledge with
 * sources — the same index the Brain room searches. Bearer token only.
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

  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json({ q, hits: [], note: "pass ?q=your question" });
  }

  try {
    const hits = await searchKnowledge(q);
    return NextResponse.json({
      q,
      hits: hits.map((h) => ({
        source: h.source,
        title: h.title,
        text: h.text,
        tags: h.tags,
        score: Number(h.score.toFixed(3)),
      })),
      rule: "answer only from these hits; cite the source; say so if nothing supports an answer",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "knowledge search unavailable", detail: (err as Error).message },
      { status: 503 },
    );
  }
}
