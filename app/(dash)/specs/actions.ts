"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { createSku, lockSpec, saveSpec, type SpecPayload } from "@/lib/specs";

async function requireUser() {
  if (!authEnabled()) {
    throw new Error("Preview mode — connect Postgres to edit specs.");
  }
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function saveSpecAction(formData: FormData) {
  const user = await requireUser();
  const skuId = String(formData.get("skuId") ?? "");
  const payload = JSON.parse(String(formData.get("payload") || "{}")) as SpecPayload;
  if (!skuId || !payload) redirect("/specs");

  const { version } = await saveSpec(skuId, payload, user);
  revalidatePath("/specs");
  revalidatePath(`/specs/${skuId}`);
  redirect(`/specs/${skuId}?v=${version}&saved=1`);
}

export async function lockSpecAction(formData: FormData) {
  const user = await requireUser();
  const specId = String(formData.get("specId") ?? "");
  const skuId = String(formData.get("skuId") ?? "");
  const locked = await lockSpec(specId, user);
  revalidatePath("/specs");
  revalidatePath(`/specs/${skuId}`);
  redirect(`/specs/${skuId}${locked ? `?v=${locked.version}&locked=1` : ""}`);
}

export async function createSpecAction(formData: FormData) {
  await requireUser();
  const entityId = String(formData.get("entityId") ?? "");
  const code = String(formData.get("code") ?? "");
  const name = String(formData.get("name") ?? "");
  const gtin = String(formData.get("gtin") ?? "");
  if (!entityId || !code || !name) redirect("/specs");

  const id = await createSku(entityId, code, name, gtin);
  revalidatePath("/specs");
  redirect(`/specs/${id}`);
}
