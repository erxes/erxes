import { customIntegrationRef, INTEGRATION_ACCOUNT_INPUT } from '@erxes/core-contract';
import { type Db, integrationAccounts } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { hookAccountOf } from './accounts.service';
import { getSetupValues } from './setups.service';
import { openSealed } from './vault';

const CustomValues = z.record(z.string(), z.string());

const pickedId = (input: Record<string, unknown>) => {
  const value = input[INTEGRATION_ACCOUNT_INPUT];

  return typeof value === 'string' && value !== '' ? value : null;
};

const usableAccount = async (tx: Db, ref: string, kind: string | undefined, id: string) => {
  const [row] = await tx
    .select()
    .from(integrationAccounts)
    .where(and(eq(integrationAccounts.id, id), eq(integrationAccounts.integration, ref)))
    .limit(1);

  if (!row || (kind && row.kind !== kind)) {
    throw fail('NOT_FOUND', 'The account this step uses was removed: pick another one');
  }

  if (row.status === 'broken') {
    throw fail(
      'INTEGRATION_REFUSED',
      `${row.name} needs reconnecting: ${row.error ?? 'the service refused it'}`,
    );
  }

  return row;
};

export const withoutAccount = (input: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(input).filter(([key]) => key !== INTEGRATION_ACCOUNT_INPUT));

export const pluginStepAccount = async (
  tx: Db,
  action: { integration?: string; accountKind?: string } | undefined,
  input: Record<string, unknown>,
) => {
  if (!action?.integration) return null;

  const id = pickedId(input);

  if (!id) throw fail('NOT_FOUND', 'This step has no account picked');

  const row = await usableAccount(tx, action.integration, action.accountKind, id);

  return { account: hookAccountOf(row), setup: await getSetupValues(tx, action.integration) };
};

export type StepAccount = NonNullable<Awaited<ReturnType<typeof pluginStepAccount>>>;

export const customStepValues = async (
  tx: Db,
  integration: { key: string },
  input: Record<string, unknown>,
) => {
  const id = pickedId(input);

  if (!id) return null;

  const row = await usableAccount(tx, customIntegrationRef(integration.key), undefined, id);

  return openSealed(row, row.secretSealed, CustomValues);
};
