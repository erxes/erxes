import { pgTableCreator } from 'drizzle-orm/pg-core';

/**
 * Every table is `__id___<name>`: the plugin shares core's database, and core
 * gives its role rights on its own tables only. Name indexes and constraints
 * in full (`__id___items_org_created_idx`).
 */
export const table = pgTableCreator((name) => `__id___${name}`);
