import { rm } from 'node:fs/promises';
import { Client } from 'pg';
import type { TestProject } from 'vite-plus/test/node';

/**
 * The API under test acts as this role: no BYPASSRLS, data rights only, like
 * production's runtime role, so row level security is really exercised.
 */
export const TEST_RUNTIME_ROLE = 'erxes_core_test_runtime';

/**
 * Once per run, before the test files start in parallel: the cluster-wide
 * runtime role and the right for the login to act as it. Each file then
 * creates only its own database (db.ts).
 */
export const setup = async (project: TestProject) => {
  const url = process.env.DATA_TEST_URL;

  if (url) {
    const client = new Client({ connectionString: url });

    await client.connect();

    try {
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${TEST_RUNTIME_ROLE}') THEN
            CREATE ROLE ${TEST_RUNTIME_ROLE} NOLOGIN NOBYPASSRLS NOSUPERUSER;
          END IF;
        END $$;
        GRANT ${TEST_RUNTIME_ROLE} TO current_user;
      `);
    } finally {
      await client.end();
    }
  }

  // Every file's uploads share one folder (keys start with the org id), removed after the run.
  const files = project.config.env.FILES_LOCAL_DIR;

  return files ? () => rm(files, { recursive: true, force: true }) : undefined;
};
