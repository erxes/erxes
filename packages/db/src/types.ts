import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type * as schema from './schema';

export type Schema = typeof schema;

export type Database = NodePgDatabase<Schema>;

export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

/** Either the pooled database or an open transaction. */
export type Db = Database | Transaction;
