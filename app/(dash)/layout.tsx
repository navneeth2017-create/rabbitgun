import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { authEnabled, getCurrentUser } from "@/lib/session";
import { usingDefaultPasswords } from "@/lib/bootstrap";

/**
 * Every room lives in this group. When a database is configured, the gate
 * is real: no session, no dashboard. Without one (local preview), the same
 * pages render with sample data and no login.
 */
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const user = authEnabled() ? await getCurrentUser() : null;
  if (authEnabled() && !user) redirect("/login");

  return <Shell user={user} defaultAuth={Boolean(user) && usingDefaultPasswords()}>{children}</Shell>;
}
