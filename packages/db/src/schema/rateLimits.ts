import { bigint, integer, text } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';

/**
 * Per-address request counts for core's HTTP rate limits, shared by every
 * replica. rate-limiter-flexible's RateLimiterPostgres owns the rows and
 * inserts by position, so the columns keep its names and order: `expire` is
 * when the window ends, in epoch milliseconds. Deployment-wide (no
 * organisation): no row level security. Unlogged (drizzle/0051): a crash
 * empties it, which only resets the windows.
 */
export const rateLimits = pgTable('rate_limits', {
  key: text().primaryKey(),
  points: integer().notNull().default(0),
  expire: bigint({ mode: 'number' }),
});
