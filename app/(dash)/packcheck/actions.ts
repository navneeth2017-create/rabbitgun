"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { createProof, decideProof } from "@/lib/proofs";

async function requireUser() {
  if (!authEnabled()) {
    throw new Error("Preview mode — connect Postgres to run checks.");
  }
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function createProofAction(formData: FormData) {
  const user = await requireUser();
  const skuId = String(formData.get("skuId") ?? "");

  const panels: { panel: string; text: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("panel:") || typeof value !== "string") continue;
    panels.push({ panel: key.slice("panel:".length), text: value });
  }

  const vendor = String(formData.get("vendor") ?? "").trim();
  if (!skuId || !vendor || panels.every((p) => !p.text.trim())) {
    redirect(`/packcheck?sku=${encodeURIComponent(skuId)}&error=${encodeURIComponent("Vendor and at least one panel of copy are required.")}`);
  }

  const proofVersion = Math.max(1, Math.trunc(Number(formData.get("proofVersion") ?? 1)) || 1);
  const input = {
    vendor,
    contact: String(formData.get("contact") ?? "").trim(),
    proofVersion,
    fileName: String(formData.get("fileName") ?? "").trim(),
    gtin: String(formData.get("gtin") ?? "").trim(),
    trimW: String(formData.get("trimW") ?? "").trim(),
    trimH: String(formData.get("trimH") ?? "").trim(),
    dieline: String(formData.get("dieline") ?? "").trim(),
    spotColors: String(formData.get("spotColors") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    panels,
  };

  let proofId: string;
  try {
    const result = await createProof(user, skuId, input);
    proofId = result.proofId;
  } catch (err) {
    redirect(`/packcheck?sku=${encodeURIComponent(skuId)}&error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/packcheck");
  redirect(`/packcheck/${proofId}?checked=1`);
}

export async function decideProofAction(formData: FormData) {
  const user = await requireUser();
  const proofId = String(formData.get("proofId") ?? "");
  const decision = formData.get("decision") === "approved" ? "approved" : "held";
  const note = String(formData.get("note") ?? "");
  if (!proofId) redirect("/packcheck");

  await decideProof(user, proofId, decision, note);
  revalidatePath("/packcheck");
  revalidatePath(`/packcheck/${proofId}`);
  redirect(`/packcheck/${proofId}?decided=${decision}`);
}
