import type { ActivityTarget } from '@erxes/core-contract';
import { companies, customers, type Db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { can } from '~/http/access';
import type { Actor, PluginCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';

/** Customers and companies: the timelines core keeps itself. */
export const isCoreTarget = (targetType: string): targetType is ActivityTarget =>
  targetType === 'customer' || targetType === 'company';

export const assertTarget = async (
  client: Db,
  orgId: string,
  targetType: ActivityTarget,
  targetId: string,
) => {
  const table = targetType === 'customer' ? customers : companies;

  const [row] = await client
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.orgId, orgId), eq(table.id, targetId)))
    .limit(1);

  if (!row) {
    throw notFound(targetType === 'customer' ? 'Customer' : 'Company');
  }
};

/** The plugin timeline a target type belongs to (from installed plugins' manifests), or null. */
const pluginTimeline = async (client: Db, orgId: string, targetType: string) => {
  const [plugin] = targetType.split('.');

  const [row] = await client
    .select({ manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(plugins.name, plugin ?? ''),
        eq(plugins.status, 'active'),
        eq(pluginInstallations.orgId, orgId),
        eq(pluginInstallations.status, 'active'),
      ),
    )
    .limit(1);

  return row?.manifest?.timelines?.find((timeline) => timeline.type === targetType) ?? null;
};

const notAllowed = (permission: string) =>
  new HttpError(403, 'NOT_ALLOWED', "Your role doesn't allow this", { permission });

/**
 * May this caller see (and note on) this timeline? Customers and companies
 * need `contacts.view` and must exist; a plugin's record type must be one an
 * installed plugin declared, with its permission (if any). Plugins reach
 * customers, companies and their own types.
 */
export const assertTimelineAccess = async (
  client: Db,
  who: { actor?: Actor | null; plugin?: PluginCaller | null; orgId: string },
  targetType: string,
  targetId: string,
) => {
  if (isCoreTarget(targetType)) {
    if (who.actor && !can(who.actor, 'contacts.view')) throw notAllowed('contacts.view');

    return assertTarget(client, who.orgId, targetType, targetId);
  }

  if (who.plugin && !targetType.startsWith(`${who.plugin.plugin}.`)) {
    throw new HttpError(
      403,
      'NOT_ALLOWED',
      'A plugin writes to customers, companies and its own record types only',
    );
  }

  const timeline = await pluginTimeline(client, who.orgId, targetType);

  if (!timeline)
    throw new HttpError(
      404,
      'NO_TIMELINE',
      `No installed plugin keeps a timeline for ${targetType}`,
    );

  if (who.actor && timeline.permission && !can(who.actor, timeline.permission))
    throw notAllowed(timeline.permission);
};
