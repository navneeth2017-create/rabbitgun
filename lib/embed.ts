/**
 * Local embeddings. MiniLM-L6 (384 dims) runs on the box itself — the same
 * model Jarvis uses — so business data is turned into vectors on home
 * hardware and never passes through any hosted model. Zero retention
 * because there is nothing retained: nothing leaves.
 */

type Extractor = (
  text: string,
  opts: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array }>;

let extractorPromise: Promise<Extractor> | null = null;

function getExtractor(): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = import("@xenova/transformers").then(({ pipeline }) =>
      pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2") as unknown as Promise<Extractor>,
    );
  }
  return extractorPromise;
}

export async function embed(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const out = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}
