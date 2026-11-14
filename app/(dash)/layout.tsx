import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { usingDefaultPasswords } from "@/lib/bootstrap";

/**
 * Every room lives in this group. When a database is configured, the gate
 * is real: no session, no dashboard. Without one (local preview), the same
 * pages render with sample data and no login.
 *
 * force-dynamic matters: at build time there is no DATABASE_URL, so the
 * gate would take the preview branch and Next would bake the dashboard
 * into static HTML — serving preview data to everyone, gate bypassed.
 * Rendering per request keeps the gate real and the badge honest.
 */
export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const user = authEnabled() ? await getCurrentUser() : null;
  if (authEnabled() && !user) redirect("/login");

  return <Shell user={user} defaultAuth={Boolean(user) && usingDefaultPasswords()}>{children}</Shell>;
}
