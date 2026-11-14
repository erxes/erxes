import { DrizzleQueryError, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseError, Pool } from 'pg';
import { config, PLUGIN } from '#/config.ts';
import * as schema from './schema.ts';

export const pool = new Pool({ connectionString: config.dataUrl, application_name: PLUGIN });

export const db = drizzle({ client: pool, schema, casing: 'snake_case' });

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The unique index a failed write hit (Postgres 23505), or undefined for any other error. */
export const uniqueViolation = (error: unknown) => {
  const cause = error instanceof DrizzleQueryError ? error.cause : error;

  return cause instanceof DatabaseError && cause.code === '23505' ? cause.constraint : undefined;
};

/**
 * Runs `fn` in a transaction scoped to one organisation. Row-level security
 * shows and accepts only that organisation's rows, so queries carry no org
 * filter, and every query that touches a table goes through here.
 */
export const withOrg = <T>(orgId: string, fn: (tx: Tx) => Promise<T>) =>
  db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.org_id', ${orgId}, true)`);

    return fn(tx);
  });
