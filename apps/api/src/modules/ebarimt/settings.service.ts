import type { coreContract } from '@erxes/core-contract';
import { caller, type Db, ebarimtReceipts, ebarimtSettings, newId } from '@erxes/core-db';
import type { InferContractRouterInputs } from '@orpc/contract';
import { asc, eq, ne, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { assertOutboundUrl, OutboundError } from '~/lib/outbound';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { configOf, listConfigs } from './plan';
import { posApiInfo } from './posapi';

type ConfigInput = InferContractRouterInputs<typeof coreContract>['ebarimt']['createConfig'];

type ConfigRow = typeof ebarimtSettings.$inferSelect;

/** A PosAPI address core may call (https and public outside development). 400 INVALID_URL. */
const checkUrl = (url: string) => {
  try {
    assertOutboundUrl(url);
  } catch (error) {
    throw fail(
      'INVALID_URL',
      error instanceof OutboundError ? error.message : 'Not a valid address',
    );
  }
};

export const configs = async (client: Db) => ({ data: await listConfigs(client) });

/** Only `id` is the default from now on. */
const makeDefault = async (client: Db, id: string) => {
  await client.update(ebarimtSettings).set({ isDefault: false }).where(ne(ebarimtSettings.id, id));
  await client.update(ebarimtSettings).set({ isDefault: true }).where(eq(ebarimtSettings.id, id));
};

const audit = (client: Db, action: string, row: ConfigRow) =>
  recordAudit(client, {
    action,
    targetType: 'ebarimt_settings',
    targetId: row.id,
    targetLabel: row.name,
    metadata: {
      status: row.status,
      isDefault: row.isDefault,
      merchantTin: row.merchantTin,
      posNo: row.posNo,
      rules: row.rules.length,
    },
  });

/** Adds a config; the first one, or one asked to be, becomes the default. */
export const createConfig = async (client: Db, input: ConfigInput) => {
  checkUrl(input.posApiUrl);

  const first = !(await configOf(client));

  const row = oneRow(
    await client
      .insert(ebarimtSettings)
      .values({ ...input, id: newId(), isDefault: false, updatedBy: caller('user').userId })
      .returning(),
  );

  if (first || input.isDefault) await makeDefault(client, row.id);

  const saved = { ...row, isDefault: first || Boolean(input.isDefault) };

  await audit(client, first ? 'ebarimt.set_up' : 'ebarimt.config_added', saved);

  return saved;
};

/** Changes a config; `isDefault` moves the default to it (the default can't be unset, only moved). */
export const updateConfig = async (client: Db, { id, ...input }: ConfigInput & { id: string }) => {
  checkUrl(input.posApiUrl);

  const before = await configOf(client, id);

  if (!before) throw notFound('eBarimt config');

  const { isDefault, ...values } = input;

  const row = oneRow(
    await client
      .update(ebarimtSettings)
      .set({ ...values, updatedBy: caller('user').userId, updatedAt: sql`now()` })
      .where(eq(ebarimtSettings.id, id))
      .returning(),
  );

  if (isDefault && !before.isDefault) await makeDefault(client, id);

  const saved = { ...row, isDefault: before.isDefault || Boolean(isDefault) };

  await audit(client, 'ebarimt.settings_changed', saved);

  return saved;
};

/**
 * Removes a config that sent no receipts; the oldest left becomes the default. 409
 * EBARIMT_CONFIG_IN_USE: its receipts may still need returning, so turn it off instead.
 */
export const removeConfig = async (client: Db, id: string) => {
  const before = await configOf(client, id);

  if (!before) return { ok: true as const };

  const [used] = await client
    .select({ id: ebarimtReceipts.id })
    .from(ebarimtReceipts)
    .where(eq(ebarimtReceipts.settingsId, id))
    .limit(1);

  if (used) throw fail('EBARIMT_CONFIG_IN_USE', 'It has sent receipts: turn it off instead');

  await client.delete(ebarimtSettings).where(eq(ebarimtSettings.id, id));

  if (before.isDefault) {
    const [next] = await client
      .select({ id: ebarimtSettings.id })
      .from(ebarimtSettings)
      .orderBy(asc(ebarimtSettings.createdAt))
      .limit(1);

    if (next) await makeDefault(client, next.id);
  }

  await audit(client, 'ebarimt.removed', before);

  return { ok: true as const };
};

/** Asks the PosAPI for its state. Calls out: outside any scope. */
export const testConnection = (posApiUrl: string) => {
  checkUrl(posApiUrl);

  return posApiInfo(posApiUrl);
};
