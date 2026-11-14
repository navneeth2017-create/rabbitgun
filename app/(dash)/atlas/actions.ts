"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { runDream } from "@/lib/dream";

export async function runDreamAction() {
  if (!authEnabled()) redirect("/atlas");
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/atlas");

  await runDream();
  revalidatePath("/atlas");
  revalidatePath("/brain");
  redirect("/atlas?dreamed=1");
}
