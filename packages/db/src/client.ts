import { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle, NodePgDatabase, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { Pool, types } from 'pg';
import * as schema from './schema';

// Counts and BIGINT columns fit JS numbers for core data.
types.setTypeParser(types.builtins.INT8, (value: string) => Number(value));

export type Schema = typeof schema;

export type Database = NodePgDatabase<Schema>;

export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

/** Either the pooled database or an open transaction. */
export type Db = Database | Transaction;

export interface DbOptions {
  url: string;
  /** TLS to Postgres. The server's certificate is verified (against `sslCa` when given). */
  ssl?: boolean;
  /** CA certificate(s), PEM (e.g. Supabase's or RDS's root CA). */
  sslCa?: string;
  /** Development only: TLS without verifying the certificate. */
  sslInsecure?: boolean;
  poolMax?: number;
  statementTimeoutMs?: number;
  applicationName?: string;
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

export const getPool = (): Pool => {
  if (!pool) {
    if (!options) {
      throw new Error('configureDb() must run before the database is used');
    }

    pool = new Pool({
      connectionString: options.url,
      max: options.poolMax ?? 10,
      idleTimeoutMillis: 30_000,
      statement_timeout: options.statementTimeoutMs ?? 15_000,
      application_name: options.applicationName ?? 'erxes-core',
      ssl: sslOptions(options),
    });

    pool.on('error', (error) => {
      console.error('[core] idle postgres client error', error.message);
    });
  }

  return pool;
};

export const db = (): Database => {
  if (!database) {
    database = drizzle(getPool(), { schema, casing: 'snake_case' });
  }

  return database;
};

export const withTransaction = <T>(fn: (tx: Transaction) => Promise<T>) => db().transaction(fn);

export const closeDb = async () => {
  const current = pool;

  pool = null;
  database = null;

  if (current) {
    await current.end();
  }
};
