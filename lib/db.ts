import pg from "pg";

/**
 * One pool per process. The connection string comes from the environment
 * (Railway injects DATABASE_URL; local dev keeps it in .env, gitignored).
 * Without a database the app still boots — it just runs in preview mode
 * with sample data and no auth. See lib/session.ts.
 */
declare global {
  // eslint-disable-next-line no-var
  var __rgPool: pg.Pool | undefined;
}

export const hasDatabase = () => Boolean(process.env.DATABASE_URL);

export function db(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!global.__rgPool) {
    global.__rgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        /sslmode=require/.test(process.env.DATABASE_URL) || process.env.PGSSL === "require"
          ? { rejectUnauthorized: false }
          : undefined,
      max: 5,
    });
  }
  return global.__rgPool;
}
