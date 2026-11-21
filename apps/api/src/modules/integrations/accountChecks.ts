import { IntegrationCheckAnswer } from '@erxes/core-contract';
import {
  callerUserId,
  type Db,
  integrationAccounts,
  requestOrgId,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { defineJob, defineSchedule } from '~/modules/jobs/jobs';
import {
  type AccountRow,
  accountsOf,
  deleteAccount,
  hookAccountOf,
  managedAccount,
  recordCheck,
} from './accounts.service';
import { definitionOf, isCustomRef, type PluginDefinition, pluginDefinitions } from './definitions';
import { askOwner, hasHook, type OwnerScope } from './owner';
import { getSetupValues } from './setups.service';

const log = logger.child({ component: 'integrations' });

const ownerScope = async (tx: Db, ref: string, userId: string | null): Promise<OwnerScope> => ({
  orgId: requestOrgId(),
  userId,
  setup: await getSetupValues(tx, ref),
});

const askCheck = async (definition: PluginDefinition, scope: OwnerScope, row: AccountRow) => {
  const answer = await askOwner(
    definition,
    scope,
    { hook: 'check', account: hookAccountOf(row) },
    IntegrationCheckAnswer,
  );

  if (!answer.ok) throw fail('INTEGRATION_REFUSED', answer.message);

  return answer.answer.error;
};

export const checkAccount = async (id: string) => {
  const orgId = requestOrgId();
  const userId = callerUserId();

  const { row, definition, scope } = await withOrg(orgId, async (tx) => {
    const account = await managedAccount(tx, id);

    if (isCustomRef(account.integration)) {
      throw fail('INVALID_TYPE', 'A custom integration has no check');
    }

    return {
      row: account,
      definition: await definitionOf(tx, account.integration),
      scope: await ownerScope(tx, account.integration, userId),
    };
  });

  if (!hasHook(definition, 'check')) {
    throw fail('INVALID_TYPE', `${definition.spec.name} has no check`);
  }

  const error = await askCheck(definition, scope, row);

  return withOrg(orgId, (tx) => recordCheck(tx, id, error));
};

export const removeAccount = async (id: string) => {
  const orgId = requestOrgId();
  const userId = callerUserId();

  const { row, definition, scope } = await withOrg(orgId, async (tx) => {
    const account = await managedAccount(tx, id);
    const custom = isCustomRef(account.integration);

    await deleteAccount(tx, id);
    await recordAudit(tx, {
      action: 'integration_account.removed',
      targetType: 'integration_account',
      targetId: id,
      targetLabel: account.name,
      metadata: { integration: account.integration, externalId: account.externalId },
    });

    return {
      row: account,
      definition: custom ? null : await definitionOf(tx, account.integration),
      scope: custom ? null : await ownerScope(tx, account.integration, userId),
    };
  });

  if (definition && scope && hasHook(definition, 'disconnect')) {
    await askOwner(
      definition,
      scope,
      { hook: 'disconnect', account: hookAccountOf(row) },
      z.unknown(),
    ).catch((error: unknown) =>
      log.warn({ err: error, accountId: id }, 'the owner did not hear of a removed account'),
    );
  }

  return { ok: true as const };
};

const checkAll = async (orgId: string) => {
  const targets = await withOrg(orgId, async (tx) => {
    const checked = (await pluginDefinitions(tx)).filter((definition) =>
      hasHook(definition, 'check'),
    );

    const loaded: { definition: PluginDefinition; scope: OwnerScope; rows: AccountRow[] }[] = [];

    await inOrder(checked, async (definition) => {
      loaded.push({
        definition,
        scope: await ownerScope(tx, definition.ref, null),
        rows: await accountsOf(tx, definition.ref),
      });
    });

    return loaded;
  });

  await inOrder(
    targets.flatMap(({ definition, scope, rows }) =>
      rows.map((row) => ({ definition, scope, row })),
    ),
    async ({ definition, scope, row }) => {
      try {
        const error = await askCheck(definition, scope, row);

        await withOrg(orgId, (tx) => recordCheck(tx, row.id, error));
      } catch (error) {
        log.warn({ err: error, accountId: row.id }, 'an account could not be checked');
      }
    },
  );
};

export const accountCheckJob = defineJob({
  queue: 'integrations.check',
  timeoutSeconds: 1800,
  retry: { attempts: 1 },
  payload: z.object({}),
  handle: (job) => checkAll(job.orgId),
});

export const accountChecksSchedule = defineSchedule({
  queue: 'integrations.check-all',
  cron: '17 3 * * *',
  run: () =>
    withSystem('integrations: daily account checks', async (tx) => {
      const orgs = await tx
        .selectDistinct({ orgId: integrationAccounts.orgId })
        .from(integrationAccounts);

      await accountCheckJob.enqueueAll(
        tx,
        orgs.map(({ orgId }) => ({ orgId, payload: {} })),
      );
    }),
});
