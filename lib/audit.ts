import { db } from "@/lib/db";
import { ensureDb } from "@/lib/bootstrap";

/**
 * The append-only record behind the Approvals room. Every write in the app
 * (spec save, spec lock, proof check, approve/hold) lands here with who,
 * when and the artifact hash.
 */

export type AuditEntry = {
  id: string;
  at: string;
  action: string;
  subject: string;
  user_name: string | null;
  meta: Record<string, unknown>;
};

export async function recentAudit(limit = 100): Promise<AuditEntry[]> {
  await ensureDb();
  const { rows } = await db().query<AuditEntry>(
    `select a.id::text, a.at, a.action, a.subject, u.name as user_name, a.meta
       from audit_log a
       left join users u on u.id = a.user_id
      order by a.at desc, a.id desc
      limit $1`,
    [limit],
  );
  return rows;
}
