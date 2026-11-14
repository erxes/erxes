import { closeDb, configureDb, runMigrations } from '@erxes/core-db';
import { rm } from 'node:fs/promises';
import { Client } from 'pg';
import type { TestProject } from 'vite-plus/test/node';

/**
 * The API under test acts as this role: no BYPASSRLS, data rights only, like
 * production's runtime role, so row level security is really exercised.
 */
export const TEST_RUNTIME_ROLE = 'erxes_core_test_runtime';

/** The Postgres server the API tests run on. Without it the run fails, it never skips. */
export const testServerUrl = () => {
  const url = process.env.DATA_TEST_URL;

  if (!url)
    throw new Error(
      'The API tests need a Postgres. Set DATA_TEST_URL to a superuser URL, e.g. ' +
        'DATA_TEST_URL=postgres://erxes:erxes_local_dev@127.0.0.1:5434/postgres vp run test',
    );

  return url;
};

/** Runs one statement on its own connection (CREATE and DROP DATABASE can't share one). */
export const admin = async (url: string, statement: string) => {
  const client = new Client({ connectionString: url });

  await client.connect();

  try {
    await client.query(statement);
  } finally {
    await client.end();
  }
};

/**
 * Drops a test database once its connections are gone. `Pool.end()` resolves
 * before its connections finish closing, and a forced drop that kills one
 * mid-goodbye surfaces as an uncaught pg error, so it waits up to 5 s first.
 */
export const dropDatabase = async (url: string, name: string) => {
  await admin(
    url,
    `
      DO $$ BEGIN
        FOR attempt IN 1..50 LOOP
          -- pg_stat_activity is read once per transaction unless the snapshot is cleared.
          PERFORM pg_stat_clear_snapshot();
          EXIT WHEN NOT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datname = '${name}');
          PERFORM pg_sleep(0.1);
        END LOOP;
      END $$;
    `,
  );
  await admin(url, `DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
};

/** The same server, another database. */
export const databaseUrl = (url: string, name: string) => {
  const parsed = new URL(url);

  parsed.pathname = `/${name}`;

  return parsed.toString();
};

/**
 * Once per run, before the test files start in parallel: the cluster-wide
 * runtime role, and a template database migrated from packages/db/drizzle and
 * granted to it. Each file copies the template (db.ts), which is much faster
 * than migrating its own.
 */
export const setup = async (project: TestProject) => {
  const url = testServerUrl();
  const { CORE_TEST_TEMPLATE: template, FILES_LOCAL_DIR: files } = project.config.env;

  if (template) {
    await admin(
      url,
      `
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${TEST_RUNTIME_ROLE}') THEN
            CREATE ROLE ${TEST_RUNTIME_ROLE} NOLOGIN NOBYPASSRLS NOSUPERUSER;
          END IF;
        END $$;
        GRANT ${TEST_RUNTIME_ROLE} TO current_user;
      `,
    );
    await admin(url, `CREATE DATABASE ${template}`);

    // Migrate as the owner, then grant the runtime role; copies keep both.
    configureDb({ url: databaseUrl(url, template), applicationName: 'erxes-core-test-migrate' });
    await runMigrations();
    await closeDb();
    await admin(databaseUrl(url, template), `SELECT core_grant_runtime('${TEST_RUNTIME_ROLE}')`);
  }

  return async () => {
    if (template) await dropDatabase(url, template);

    // Every file's uploads share one folder (keys start with the org id).
    if (files) await rm(files, { recursive: true, force: true });
  };
};
