"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { addNote } from "@/lib/private";

export async function addNoteAction(formData: FormData) {
  if (!authEnabled()) redirect("/private");
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) redirect("/private");
  const title = String(formData.get("title") ?? "");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await addNote(user, body, title, tags);
  revalidatePath("/private");
  redirect("/private?saved=1");
}
