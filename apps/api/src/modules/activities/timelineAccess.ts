import {
  type ActivityTarget,
  RecordAccessAnswer,
  type RecordAccessCheck,
} from '@erxes/core-contract';
import {
  activities,
  caller,
  companies,
  customers,
  type Db,
  newId,
  requestOrgId,
  withOrg,
} from '@erxes/core-db';
import { eq, inArray } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { logger } from '~/logger';
import { installedPlugin } from '~/modules/plugins/installedPlugin';
import { deliverToPlugin } from '~/modules/plugins/pluginDelivery';

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

/**
 * The plugin timeline a target type belongs to (from installed plugins' manifests), with the
 * plugin's name and API address, or null.
 */
export const pluginTimeline = async (client: Db, targetType: string) => {
  const [plugin] = targetType.split('.');
  const row = await installedPlugin(client, plugin ?? '');
  const timeline = row?.manifest?.timelines?.find((entry) => entry.type === targetType);

  return row && timeline ? { ...timeline, plugin: row.name, apiUrl: row.manifest?.api?.url } : null;
};

const CORE_ACCESS_TYP = 'erxes-core-access+jwt';

/** The plugin's answer to `check`; no answer, or anything but `{ "allowed": true }`, is no. */
const askPlugin = (plugin: string, apiUrl: string, check: RecordAccessCheck) =>
  deliverToPlugin({
    plugin,
    url: apiUrl,
    path: '/timelines/access',
    orgId: check.orgId,
    kind: 'access',
    id: newId(),
    body: JSON.stringify(check),
    typ: CORE_ACCESS_TYP,
    headers: {},
    timeoutMs: 5000,
  })
    .then((answer) => RecordAccessAnswer.parse(JSON.parse(answer)).allowed)
    .catch((error: unknown) => {
      logger.warn(
        { plugin, type: check.type, id: check.id, err: error },
        'no record access answer',
      );

      return false;
    });

/** The record a timeline entry is on; 404 when there is no such entry. */
export const entryTarget = async (client: Db, id: string) => {
  const [row] = await client
    .select({ targetType: activities.targetType, targetId: activities.targetId })
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);

  if (!row) throw notFound('Entry');

  return row;
};

/**
 * A member's call on a plugin record's timeline, when its type has `recordAccess`: the plugin
 * says whether they may read that record. The target is read in a short transaction and the
 * plugin is asked after it, outside any, as `postOutbound` requires. Then `work` runs in the
 * organisation's transaction.
 */
export const onTimeline = async <T>(
  target: (tx: Db) => Promise<{ targetType: string; targetId: string }>,
  work: (tx: Db) => Promise<T>,
) => {
  const who = caller();
  const orgId = requestOrgId();

  if (who.type === 'user') {
    const ask = await withOrg(orgId, async (tx) => {
      const { targetType, targetId } = await target(tx);
      const timeline = isCoreTarget(targetType) ? null : await pluginTimeline(tx, targetType);

      return timeline?.recordAccess ? { timeline, type: targetType, id: targetId } : null;
    });

    if (ask) {
      const { timeline, ...record } = ask;
      const check = { orgId, userId: who.userId, ...record };

      if (!timeline.apiUrl || !(await askPlugin(timeline.plugin, timeline.apiUrl, check)))
        throw fail('NOT_ALLOWED', `This ${timeline.label.toLowerCase()} is not one you may see`);
    }
  }

  return withOrg(orgId, work);
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
