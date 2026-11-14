"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { saveCorrection } from "@/lib/corrections";

export async function correctBrainAction(formData: FormData) {
  if (!authEnabled()) redirect("/brain");
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const hitTitle = String(formData.get("hitTitle") ?? "").trim();
  const hitSource = String(formData.get("hitSource") ?? "brain");
  const correctedText = String(formData.get("correctedText") ?? "").trim();
  const q = String(formData.get("q") ?? "");

  if (!hitTitle || !correctedText) redirect(`/brain?q=${encodeURIComponent(q)}`);

  await saveCorrection(user, hitTitle, hitSource, correctedText);
  revalidatePath("/brain");
  revalidatePath("/atlas");
  redirect(`/brain?q=${encodeURIComponent(q)}&fixed=1`);
}
