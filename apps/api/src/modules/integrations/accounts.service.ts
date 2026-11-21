import {
  type IntegrationCandidate,
  INTEGRATION_ACCOUNT_MAX,
  INTEGRATION_USAGE_MAX,
} from '@erxes/core-contract';
import {
  automations,
  automationVersions,
  callerUserId,
  type Db,
  integrationAccounts,
  newId,
  runAs,
  system,
} from '@erxes/core-db';
import { and, asc, count, eq, exists, like, or, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { logger } from '~/logger';
import { notify } from '~/modules/notifications/notifications.service';
import {
  CUSTOM_ACCOUNT_KIND,
  customIntegrationOf,
  isCustomRef,
  managedDefinition,
} from './definitions';
import { openValues, sealValues } from './vault';

const log = logger.child({ component: 'integrations' });

export type AccountRow = typeof integrationAccounts.$inferSelect;

const byName = [asc(sql`lower(${integrationAccounts.name})`), asc(integrationAccounts.id)];

export const accountsOf = (client: Db, ref: string, kind?: string) =>
  client
    .select()
    .from(integrationAccounts)
    .where(
      and(
        eq(integrationAccounts.integration, ref),
        kind ? eq(integrationAccounts.kind, kind) : undefined,
      ),
    )
    .orderBy(...byName)
    .limit(INTEGRATION_ACCOUNT_MAX);

const assertManaged = async (client: Db, ref: string) => {
  if (isCustomRef(ref)) await customIntegrationOf(client, ref);
  else await managedDefinition(client, ref);
};

export const listAccounts = async (client: Db, ref: string) => {
  await assertManaged(client, ref);

  return { data: await accountsOf(client, ref) };
};

export const accountChoices = async (client: Db, ref: string, kind?: string) => ({
  data: await accountsOf(client, ref, kind),
});

export const findAccount = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(integrationAccounts)
    .where(eq(integrationAccounts.id, id))
    .limit(1);

  if (!row) throw notFound('Account');

  return row;
};

export const managedAccount = async (client: Db, id: string) => {
  const row = await findAccount(client, id);

  await assertManaged(client, row.integration);

  return row;
};

export const hookAccountOf = (row: AccountRow) => ({
  id: row.id,
  kind: row.kind,
  externalId: row.externalId,
  name: row.name,
  detail: row.detail,
  config: row.config,
  secret: openValues(row, row.secretSealed),
});

export const assertRoomFor = async (client: Db, ref: string, added: number) => {
  const [row] = await client
    .select({ total: count() })
    .from(integrationAccounts)
    .where(eq(integrationAccounts.integration, ref));

  if ((row?.total ?? 0) + added > INTEGRATION_ACCOUNT_MAX) {
    throw fail(
      'LIMIT_EXCEEDED',
      `An integration has at most ${INTEGRATION_ACCOUNT_MAX} accounts: remove some first`,
    );
  }
};

export const saveCandidate = async (
  client: Db,
  ref: string,
  id: string,
  candidate: IntegrationCandidate,
  createdBy: string | null,
) =>
  oneRow(
    await client
      .insert(integrationAccounts)
      .values({
        id,
        integration: ref,
        kind: candidate.kind,
        externalId: candidate.externalId,
        name: candidate.name,
        detail: candidate.detail,
        config: candidate.config,
        secretSealed: sealValues(candidate.secret),
        sealedNames: Object.keys(candidate.secret).toSorted(),
        checkedAt: sql`now()`,
        createdBy,
      })
      .onConflictDoUpdate({
        target: [
          integrationAccounts.orgId,
          integrationAccounts.integration,
          integrationAccounts.kind,
          integrationAccounts.externalId,
        ],
        set: {
          detail: candidate.detail,
          config: candidate.config,
          secretSealed: sealValues(candidate.secret),
          sealedNames: Object.keys(candidate.secret).toSorted(),
          status: 'healthy',
          error: null,
          checkedAt: sql`now()`,
          updatedAt: sql`now()`,
        },
      })
      .returning(),
  );

export const renameAccount = async (client: Db, id: string, name: string) => {
  await managedAccount(client, id);

  return oneRow(
    await client
      .update(integrationAccounts)
      .set({ name, updatedAt: sql`now()` })
      .where(eq(integrationAccounts.id, id))
      .returning(),
  );
};

export const deleteAccount = (client: Db, id: string) =>
  client.delete(integrationAccounts).where(eq(integrationAccounts.id, id));

export const accountUsage = async (client: Db, id: string) => {
  await managedAccount(client, id);

  const named = `%"${id}"%`;

  return {
    automations: await client
      .select({ id: automations.id, name: automations.name })
      .from(automations)
      .where(
        or(
          like(sql`${automations.definition}::text`, named),
          exists(
            client
              .select({ one: sql`1` })
              .from(automationVersions)
              .where(
                and(
                  eq(automationVersions.automationId, automations.id),
                  eq(automationVersions.version, automations.activeVersion),
                  like(sql`${automationVersions.definition}::text`, named),
                ),
              ),
          ),
        ),
      )
      .orderBy(asc(sql`lower(${automations.name})`), asc(automations.id))
      .limit(INTEGRATION_USAGE_MAX),
  };
};

export const createCustomAccount = async (
  client: Db,
  input: { integration: string; name: string; secrets: Record<string, string> },
) => {
  await customIntegrationOf(client, input.integration);
  await assertRoomFor(client, input.integration, 1);

  const id = newId();

  return oneRow(
    await client
      .insert(integrationAccounts)
      .values({
        id,
        integration: input.integration,
        kind: CUSTOM_ACCOUNT_KIND,
        externalId: id,
        name: input.name,
        secretSealed: sealValues(input.secrets),
        sealedNames: Object.keys(input.secrets).toSorted(),
        createdBy: callerUserId(),
      })
      .returning(),
  );
};

export const setCustomSecrets = async (
  client: Db,
  id: string,
  secrets: Record<string, string | null>,
) => {
  const account = await findAccount(client, id);

  await customIntegrationOf(client, account.integration);

  const values = Object.fromEntries(
    Object.entries({ ...openValues(account, account.secretSealed), ...secrets }).flatMap(
      ([name, value]) => (value === null ? [] : [[name, value]]),
    ),
  );

  return oneRow(
    await client
      .update(integrationAccounts)
      .set({
        secretSealed: sealValues(values),
        sealedNames: Object.keys(values).toSorted(),
        updatedAt: sql`now()`,
      })
      .where(eq(integrationAccounts.id, id))
      .returning(),
  );
};

export const recordCheck = async (client: Db, id: string, error: string | null) => {
  const [locked] = await client
    .select()
    .from(integrationAccounts)
    .where(eq(integrationAccounts.id, id))
    .for('update');

  if (!locked) throw notFound('Account');

  const checked = oneRow(
    await client
      .update(integrationAccounts)
      .set({ status: error ? 'broken' : 'healthy', error, checkedAt: sql`now()` })
      .where(eq(integrationAccounts.id, id))
      .returning(),
  );

  if (error && locked.status === 'healthy' && locked.createdBy) {
    const userId = locked.createdBy;

    await runAs(system('integration account broke'), () =>
      notify(client, {
        userIds: [userId],
        kind: 'core.integration.broken',
        title: `${locked.name} needs reconnecting`,
        body: error,
        link: `/settings/integrations/${locked.integration}`,
        priority: 'high',
        entityType: 'integration_account',
        entityId: id,
        dedupeKey: `integration-broken:${id}:${checked.checkedAt?.toISOString() ?? ''}`,
      }),
    ).catch((notifyError: unknown) =>
      log.warn({ accountId: id, err: notifyError }, 'could not notify about a broken account'),
    );
  }

  return checked;
};
