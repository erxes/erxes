import type { ActivityTarget } from '@erxes/core-contract';
import {
  caller,
  companies,
  customers,
  type Db,
  pluginInstallations,
  plugins,
} from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';

/** Customers and companies: the timelines core keeps itself. */
export const isCoreTarget = (targetType: string): targetType is ActivityTarget =>
  targetType === 'customer' || targetType === 'company';

const anyMissing = async (
  client: Db,
  table: typeof customers | typeof companies,
  ids: string[],
) => {
  const wanted = unique(ids);

  if (!wanted.length) return false;

  const rows = await client.select({ id: table.id }).from(table).where(inArray(table.id, wanted));

  return rows.length < wanted.length;
};

/** 404 unless every customer and company is the organisation's (a query per type). */
export const assertTargets = async (
  client: Db,
  targets: { type: ActivityTarget; id: string }[],
) => {
  const idsOf = (type: ActivityTarget) =>
    targets.filter((target) => target.type === type).map((target) => target.id);

  if (await anyMissing(client, customers, idsOf('customer'))) throw notFound('Customer');

  if (await anyMissing(client, companies, idsOf('company'))) throw notFound('Company');
};

/** The plugin timeline a target type belongs to (from installed plugins' manifests), or null. */
const pluginTimeline = async (client: Db, targetType: string) => {
  const [plugin] = targetType.split('.');

  const [row] = await client
    .select({ manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(plugins.name, plugin ?? ''),
        eq(plugins.status, 'active'),
        eq(pluginInstallations.status, 'active'),
      ),
    )
    .limit(1);

  return row?.manifest?.timelines?.find((timeline) => timeline.type === targetType) ?? null;
};

const notAllowed = (permission: string) =>
  fail('NOT_ALLOWED', "Your role doesn't allow this", { permission });

/**
 * May this caller see (and note on) this timeline? Customers and companies
 * need `contacts.view` and must exist; a plugin's record type must be one an
 * installed plugin declared, with its permission (if any). Plugins reach
 * customers, companies and their own types.
 */
export const assertTimelineAccess = async (client: Db, targetType: string, targetId: string) => {
  const who = caller();

  if (isCoreTarget(targetType)) {
    if (who.type === 'user' && !can(who, 'contacts.view')) throw notAllowed('contacts.view');

    return assertTargets(client, [{ type: targetType, id: targetId }]);
  }

  if (who.type === 'plugin' && !targetType.startsWith(`${who.plugin}.`)) {
    throw fail(
      'NOT_ALLOWED',
      'A plugin writes to customers, companies and its own record types only',
    );
  }

  const timeline = await pluginTimeline(client, targetType);

  if (!timeline)
    throw fail('NO_TIMELINE', `No installed plugin keeps a timeline for ${targetType}`);

  if (who.type === 'user' && timeline.permission && !can(who, timeline.permission))
    throw notAllowed(timeline.permission);
};
