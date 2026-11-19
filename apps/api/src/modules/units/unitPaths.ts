import { sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

const CHARACTER_AFTER_SLASH = sql.raw("'0'");

const firstPathAfterSubtree = (path: PgColumn | string) =>
  sql`(left(${path}, -1) || ${CHARACTER_AFTER_SLASH})`;

/** Is `inner` the path of `outer`'s unit or of a unit under it? A range the path index reads. */
export const within = (inner: PgColumn, outer: PgColumn | string) =>
  sql`(${inner} ~>=~ ${outer} and ${inner} ~<~ ${firstPathAfterSubtree(outer)})`;
