import { type ImportedIntegrationAccount, pluginIntegrationRef } from '@erxes/core-contract';
import { caller, type Db, integrationAccounts } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { accountsOf, assertRoomFor, findAccount, recordCheck } from './accounts.service';
import { assertKinds, keyOf } from './connect';
import { kindLabel, ownDefinition } from './definitions';
import { getSetupValues, seedSetup } from './setups.service';
import { openValues, sealValues } from './vault';

const ownAccount = async (client: Db, id: string) => {
  const row = await findAccount(client, id);

  if (!row.integration.startsWith(`${caller('plugin').plugin}.`)) throw notFound('Account');

  return row;
};

export const pluginAccounts = async (client: Db, key: string, kind?: string) => ({
  data: await accountsOf(client, pluginIntegrationRef(caller('plugin').plugin, key), kind),
});

const insertImported = (client: Db, ref: string, accounts: ImportedIntegrationAccount[]) =>
  client
    .insert(integrationAccounts)
    .values(
      accounts.map(({ secret, ...account }) => ({
        ...account,
        integration: ref,
        secretSealed: sealValues(secret),
        sealedNames: Object.keys(secret).toSorted(),
        checkedAt: sql`now()`,
      })),
    )
    .onConflictDoUpdate({
      target: [
        integrationAccounts.orgId,
        integrationAccounts.integration,
        integrationAccounts.kind,
        integrationAccounts.externalId,
      ],
      set: {
        name: sql`excluded.name`,
        detail: sql`excluded.detail`,
        config: sql`excluded.config`,
        secretSealed: sql`excluded.secret_sealed`,
        sealedNames: sql`excluded.sealed_names`,
        status: 'healthy',
        error: null,
        checkedAt: sql`now()`,
        updatedAt: sql`now()`,
      },
    })
    .returning();

export const importAccounts = async (
  client: Db,
  input: {
    integration: string;
    setup?: Record<string, unknown>;
    accounts: ImportedIntegrationAccount[];
  },
) => {
  const definition = await ownDefinition(client, input.integration);

  assertKinds(definition, input.accounts);

  const known = new Set((await accountsOf(client, definition.ref)).map(keyOf));

  await assertRoomFor(
    client,
    definition.ref,
    input.accounts.filter((account) => !known.has(keyOf(account))).length,
  );

  if (input.setup) await seedSetup(client, definition, input.setup);

  if (!input.accounts.length) return { data: [] };

  const rows = await insertImported(client, definition.ref, input.accounts);

  await recordAudit(
    client,
    rows.map((account) => ({
      action: 'integration_account.imported',
      targetType: 'integration_account',
      targetId: account.id,
      targetLabel: account.name,
      metadata: {
        integration: definition.ref,
        kind: kindLabel(definition, account.kind),
        externalId: account.externalId,
      },
    })),
  );

  return { data: rows };
};

export const openAccount = async (client: Db, id: string) => {
  const row = await ownAccount(client, id);

  return {
    ...row,
    secret: openValues(row, row.secretSealed),
    setup: await getSetupValues(client, row.integration),
  };
};

export const pluginUpdateAccount = async (
  client: Db,
  id: string,
  changes: {
    name?: string;
    detail?: string | null;
    config?: Record<string, unknown>;
    secret?: Record<string, unknown>;
  },
) => {
  await ownAccount(client, id);

  const { secret, ...plain } = changes;

  return oneRow(
    await client
      .update(integrationAccounts)
      .set({
        ...plain,
        ...(secret && {
          secretSealed: sealValues(secret),
          sealedNames: Object.keys(secret).toSorted(),
        }),
        updatedAt: sql`now()`,
      })
      .where(eq(integrationAccounts.id, id))
      .returning(),
  );
};

export const reportAccount = async (client: Db, id: string, error: string | null) => {
  await ownAccount(client, id);

  return recordCheck(client, id, error);
};

export const ownSetup = async (client: Db, key: string) => {
  const definition = await ownDefinition(client, key);

  return { setup: await getSetupValues(client, definition.ref) };
};
