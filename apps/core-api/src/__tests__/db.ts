import { closeDb, configureDb, runMigrations } from '@erxes/core-db';
import { randomBytes } from 'node:crypto';
import { Client } from 'pg';
import { afterAll, beforeAll, describe } from 'vite-plus/test';

const baseUrl = process.env.DATA_TEST_URL ?? '';

/** Runs the suite only when DATA_TEST_URL points at a Postgres (CI sets it). */
export const describeWithDb = baseUrl ? describe : describe.skip;

const admin = async (statement: string) => {
  const client = new Client({ connectionString: baseUrl });

  await client.connect();

  try {
    await client.query(statement);
  } finally {
    await client.end();
  }
};

let currentUrl = '';

/** The throwaway database's address (after `useTestDatabase` set it up). */
export const testDatabaseUrl = () => currentUrl;

/** A throwaway database for this test file, migrated from packages/db/drizzle. */
export const useTestDatabase = () => {
  const name = `core_test_${randomBytes(4).toString('hex')}`;

  beforeAll(async () => {
    await admin(`CREATE DATABASE ${name}`);

    const url = new URL(baseUrl);
    url.pathname = `/${name}`;

    currentUrl = url.toString();
    configureDb({ url: currentUrl, applicationName: 'erxes-core-test' });
    await runMigrations();

    // The test plugin (`hr`, from CORE_PLUGIN_KEYS in vitest.config.ts).
    const { syncPluginSecrets } = await import('~/modules/plugins/plugins.service');

    await syncPluginSecrets();
  });

  afterAll(async () => {
    await closeDb();
    await admin(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  });
};
