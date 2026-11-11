import { closeDb, configureDb, runMigrations } from '@erxes/core-db';
import { randomBytes } from 'node:crypto';
import { Client } from 'pg';
import { afterAll, beforeAll, describe } from 'vitest';

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

/** A throwaway database for this test file, migrated from packages/db/drizzle. */
export const useTestDatabase = () => {
  const name = `core_test_${randomBytes(4).toString('hex')}`;

  beforeAll(async () => {
    await admin(`CREATE DATABASE ${name}`);

    const url = new URL(baseUrl);
    url.pathname = `/${name}`;

    configureDb({ url: url.toString(), applicationName: 'erxes-core-test' });
    await runMigrations();
  });

  afterAll(async () => {
    await closeDb();
    await admin(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  });
};
