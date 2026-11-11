import { pgTableCreator } from 'drizzle-orm/pg-core';

/**
 * Every core table is `core_<name>`: the database is shared with plugins
 * (`<plugin>_<name>`). Index and constraint names are global in the schema,
 * so they repeat the full prefixed table name.
 */
export const pgTable = pgTableCreator((name) => `core_${name}`);
