import type { PluginAccess } from '@erxes/core-contract';
import type { entitlements } from '@erxes/core-db';
import { config } from '~/config';

export type EntitlementRow = typeof entitlements.$inferSelect;

/** Why an installation is off when the plugin left the plan (on again when it's bought again). */
export const NOT_IN_PLAN = 'Not in your plan';

const DAY = 24 * 60 * 60 * 1000;

/** The organisation is turned off on erxes.io (`inactive` or `suspended`): nobody gets in. */
export const organizationDisabled = (row: EntitlementRow | null | undefined) =>
  Boolean(config.saas.enabled && row && row.orgStatus !== 'active');

export const readOnlyUntil = (
  row: EntitlementRow | null | undefined,
  code: string,
): Date | null => {
  const since = row?.lapsed[code];

  return since ? new Date(new Date(since).getTime() + config.saas.graceDays * DAY) : null;
};

/**
 * What a plugin may do in an organisation, from what erxes.io last said:
 * in the plan → `full` (`warning` while a payment retries or the plugin ends
 * at period end); left the plan → `read_only` for the grace days, then
 * `off`; never had it → `off`. Self-hosted, and organisations erxes.io
 * hasn't answered for yet, are `full`.
 */
export const accessOf = (
  row: EntitlementRow | null | undefined,
  code: string,
  now = new Date(),
): PluginAccess => {
  if (!config.saas.enabled || !row) return 'full';

  const entry = row.plugins.find((plugin) => plugin.code === code);

  if (entry) return entry.status === 'active' ? 'full' : 'warning';

  const until = readOnlyUntil(row, code);

  return until && until > now ? 'read_only' : 'off';
};

/** The tier a plugin has here (self-hosted: everything, as Pro). */
export const tierOf = (row: EntitlementRow | null | undefined, code: string) =>
  !config.saas.enabled
    ? 'pro'
    : (row?.plugins.find((plugin) => plugin.code === code)?.tier ?? (row ? null : 'pro'));
