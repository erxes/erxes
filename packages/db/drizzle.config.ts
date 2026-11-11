import { defineConfig } from 'drizzle-kit';

// `pnpm db:generate` writes a SQL migration for changes in src/schema.
// The API applies pending migrations from ./drizzle at startup (src/migrate.ts).
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  casing: 'snake_case',
  dbCredentials: {
    url:
      process.env.DATA_URL ||
      'postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes',
  },
  // Core shares the database with plugins: only touch core_* tables.
  tablesFilter: ['core_*'],
  migrations: { schema: 'public', table: '__drizzle_migrations_core' },
  strict: true,
  verbose: true,
});
