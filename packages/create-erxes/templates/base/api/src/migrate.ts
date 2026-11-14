// `pnpm db:migrate` applies pending migrations without starting the API. Its own entry, not an
// `import.meta.main` branch in db/migrate.ts: the bundle inlines that module into dist/main.mjs,
// where the branch would run and end the pool before the API starts.
import { pool } from '#/db/client.ts';
import { runMigrations } from '#/db/migrate.ts';

await runMigrations();

await pool.end();
