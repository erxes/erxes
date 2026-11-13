import { closeDb, configureDb, schema } from '@erxes/core-db';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { afterAll, beforeAll } from 'vite-plus/test';
import { randomToken } from '~/lib/crypto';
import { admin, databaseUrl, dropDatabase, TEST_RUNTIME_ROLE, testServerUrl } from './globalSetup';

const baseUrl = testServerUrl();

let currentUrl = '';
let ownerPool: Pool | null = null;
let owner: NodePgDatabase<typeof schema> | null = null;

/** The throwaway database's address (after `useTestDatabase` set it up). */
export const testDatabaseUrl = () => currentUrl;

/**
 * The owner's connection, for fixtures and checks only (it bypasses row
 * level security). Code under test uses `db()` / scopes as the runtime role.
 */
export const adminDb = () => {
  if (!owner) throw new Error('adminDb() is only available inside useTestDatabase()');

  return owner;
};

/**
 * A session connection (SET ROLE must stick to the connection): Supabase's
 * transaction pooler (6543) → its session pooler (5432).
 */
const sessionUrl = (url: string) => {
  const parsed = new URL(url);

  if (parsed.port === '6543') parsed.port = '5432';

  return parsed.toString();
};

/** A throwaway database for this test file, copied from the run's migrated template. */
export const useTestDatabase = () => {
  const name = `core_test_${randomToken(4, 'hex')}`;

  beforeAll(async () => {
    // A copy of the run's migrated template, which already grants the runtime role (globalSetup.ts).
    await admin(baseUrl, `CREATE DATABASE ${name} TEMPLATE ${process.env.CORE_TEST_TEMPLATE}`);

    currentUrl = databaseUrl(baseUrl, name);

    ownerPool = new Pool({
      connectionString: currentUrl,
      max: 3,
      application_name: 'erxes-core-test-owner',
    });
    owner = drizzle(ownerPool, { schema, casing: 'snake_case' });

    configureDb({
      url: sessionUrl(currentUrl),
      role: TEST_RUNTIME_ROLE,
      poolMax: 5,
      applicationName: 'erxes-core-test',
    });

    // The test plugin (`hr`, from CORE_PLUGIN_KEYS in vitest.config.ts).
    const { syncPluginSecrets } = await import('~/modules/plugins/plugins.service');

    await syncPluginSecrets();
  });

  afterAll(async () => {
    await closeDb();
    await ownerPool?.end();
    ownerPool = null;
    owner = null;
    await dropDatabase(baseUrl, name);
  });
};

/** A member token at their current session version (after resets, disables, …). */
export const currentToken = async (userId: string, orgId: string) => {
  const { users } = await import('@erxes/core-db');
  const { eq } = await import('drizzle-orm');
  const { signAccessToken } = await import('~/http/auth');

  const [row] = await adminDb()
    .select({ sessionVersion: users.sessionVersion })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return signAccessToken(userId, orgId, undefined, row?.sessionVersion ?? 1);
};

/** The database's own message behind a failed query, or '' when it succeeded. */
export const dbError = (query: Promise<unknown>) =>
  query.then(
    () => '',
    (error: { cause?: { message?: string }; message: string }) =>
      error.cause?.message ?? error.message,
  );
