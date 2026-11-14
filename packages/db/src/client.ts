import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, types } from 'pg';
import * as schema from './schema';
import { currentScope } from './scope';
import type { Database, Db } from './types';

// Counts and BIGINT columns fit JS numbers for core data.
types.setTypeParser(types.builtins.INT8, (value: string) => Number(value));

export interface DbOptions {
  url: string;
  /** TLS to Postgres. The server's certificate is verified (against `sslCa` when given). */
  ssl?: boolean;
  /** CA certificate(s), PEM (e.g. Supabase's or RDS's root CA). */
  sslCa?: string;
  /** Development only: TLS without verifying the certificate. */
  sslInsecure?: boolean;
  /**
   * A role to act as on every connection (`SET ROLE`), e.g. the runtime role
   * when the login is the owner. Only with session connections (direct
   * Postgres, a session pooler): a transaction pooler would not keep it.
   */
  role?: string;
  poolMax?: number;
  statementTimeoutMs?: number;
  applicationName?: string;
  /** An idle pooled connection broke (the pool drops it). Default: a process warning. */
  onIdleError?: (error: Error) => void;
}

/** pg's TLS options: verified unless explicitly insecure. */
export const sslOptions = (value: Pick<DbOptions, 'ssl' | 'sslCa' | 'sslInsecure'>) =>
  value.ssl
    ? { rejectUnauthorized: !value.sslInsecure, ...(value.sslCa ? { ca: value.sslCa } : {}) }
    : undefined;

let options: DbOptions | null = null;
let pool: Pool | null = null;
let database: Database | null = null;

/** Called once at startup (and by tests) before `db()` is used. */
export const configureDb = (next: DbOptions) => {
  options = next;
};

/**
 * How to connect, for core's pool and the job queue's (`QUEUE_SCHEMA`): the
 * same server, TLS and role.
 */
export const connectionSettings = () => {
  if (!options) throw new Error('configureDb() must run before the database is used');

  const { role } = options;

  if (role && !/^[a-z_][a-z0-9_]{0,62}$/.test(role)) throw new Error(`invalid role name: ${role}`);

  return {
    connectionString: options.url,
    application_name: options.applicationName ?? 'erxes-core',
    ssl: sslOptions(options),
    // Set when the connection starts: a role that can't be taken refuses the
    // connection instead of leaving it acting as the login (which may bypass RLS).
    ...(role ? { options: `-c role=${role}` } : {}),
  };
};

export const getPool = (): Pool => {
  if (pool) return pool;

  const settings = connectionSettings();

  pool = new Pool({
    ...settings,
    max: options?.poolMax ?? 10,
    idleTimeoutMillis: 30_000,
    statement_timeout: options?.statementTimeoutMs ?? 15_000,
  });

  pool.on('error', (error) => {
    if (options?.onIdleError) options.onIdleError(error);
    else process.emitWarning(`idle postgres connection error: ${error.message}`);
  });

  return pool;
};

/** The pool itself, outside any tenant scope (scopes and migrations use it). */
export const rootDb = (): Database => {
  database ??= drizzle(getPool(), { schema, casing: 'snake_case' });

  return database;
};

/**
 * The database for the current tenant scope: inside `withOrg` / `withSystem`
 * (see `./tenant`), that scope's transaction; outside, the pool — where row
 * level security lets nothing through, so a query that forgot its scope
 * fails closed.
 */
export const db = (): Db => currentScope()?.tx ?? rootDb();

export const closeDb = async () => {
  const current = pool;

  pool = null;
  database = null;

  if (current) {
    await current.end();
  }
};
