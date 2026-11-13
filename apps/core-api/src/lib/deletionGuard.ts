import { type Db, deletionCounters, pluginInstallations, withOrgDetached } from '@erxes/core-db';
import { and, eq, gte, sql } from 'drizzle-orm';
import { config } from '~/config';
import { type Caller, systemCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { logger } from '~/logger';
import { ownerIds } from '~/modules/audit/alerts';
import { recordAudit } from '~/modules/audit/audit.service';
import { notify } from '~/modules/notifications/notifications.service';

const log = logger.child({ component: 'deletions' });

/** Adds `count` to the caller's counter and returns its deletions in the last 10 minutes. */
const countDeletions = async (tx: Db, actor: string, count: number) => {
  const bucket = sql`date_bin('5 minutes', now(), timestamptz '2000-01-01')`;

  await tx
    .insert(deletionCounters)
    .values({ actor, bucket, count })
    .onConflictDoUpdate({
      target: [deletionCounters.orgId, deletionCounters.actor, deletionCounters.bucket],
      set: { count: sql`${deletionCounters.count} + ${count}` },
    });

  // This window and the one before: a burst across the boundary still counts.
  const [{ total } = { total: 0 }] = await tx
    .select({ total: sql<number>`coalesce(sum(${deletionCounters.count}), 0)::int` })
    .from(deletionCounters)
    .where(
      and(
        eq(deletionCounters.actor, actor),
        gte(deletionCounters.bucket, sql`now() - interval '10 minutes'`),
      ),
    );

  return total;
};

interface MassDeletion {
  caller: Caller;
  /** `<actorType>:<actorId>`, the counter's key. */
  actor: string;
  total: number;
  what: string;
  stop: boolean;
}

/** Tells the owners, once per window and outcome. */
const reportMassDeletion = async (
  client: Db,
  { caller, actor, total, what, stop }: MassDeletion,
) => {
  const who = caller.actorType === 'plugin' ? `The ${caller.actorId} plugin` : 'A team member';
  const recipients = await ownerIds(client);

  await notify(client, systemCaller(caller.orgId), {
    userIds: recipients,
    kind: 'core.security.mass_deletion',
    title: stop
      ? `${who} was stopped after deleting ${total} ${what}`
      : `${who} deleted ${total} ${what} in a few minutes`,
    body: stop
      ? caller.actorType === 'plugin'
        ? 'The plugin is suspended in your organisation. Deleted records are in the recycle bin; install the plugin again to resume it.'
        : 'Further deletions are refused for now. Deleted records are in the recycle bin.'
      : 'Deleted records stay in the recycle bin for 30 days.',
    link: '/settings/recycle-bin',
    priority: 'high',
    entity: { type: caller.actorType, id: caller.actorId ?? 'system' },
    data: { actor, total },
    dedupeKey: `mass-deletion:${actor}:${stop ? 'stop' : 'alert'}:${new Date().toISOString().slice(0, 15)}`,
  }).catch((error: unknown) =>
    log.warn({ err: error }, 'could not tell owners about mass deletion'),
  );
};

/** Saves the stop outside the refused request: its audit entry and, for a plugin, the suspension. */
const recordStop = (deletion: MassDeletion) => {
  const { caller, total, what } = deletion;
  const actorId = caller.actorId ?? 'system';

  return withOrgDetached(caller.orgId, async (own) => {
    await reportMassDeletion(own, deletion);
    await recordAudit(own, systemCaller(caller.orgId), {
      action: 'security.mass_deletion_stopped',
      targetType: caller.actorType,
      targetId: actorId,
      metadata: { total, what },
    });

    if (caller.actorType !== 'plugin') return;

    await own
      .update(pluginInstallations)
      .set({
        status: 'disabled',
        statusReason: `Suspended: ${total} deletions in a few minutes`,
        updatedAt: sql`now()`,
      })
      .where(eq(pluginInstallations.plugin, actorId));
    log.warn(
      {
        org: caller.orgId,
        plugin: caller.actorId,
        total,
      },
      'plugin suspended after mass deletion',
    );
  });
};

/**
 * Counts deletions by whoever is calling and stops a runaway: a stolen token,
 * a script gone wrong, a broken or malicious plugin. Call before deleting
 * (in the same transaction). Past the alert line the owners hear about it
 * once per window; past the stop line a member's deletion is refused and a
 * plugin is suspended in the organisation (the owner resumes it by installing
 * it again). Everything deleted stays in the recycle bin.
 */
export const guardDeletions = async (
  tx: Db,
  caller: Caller,
  count: number,
  what: string,
  actorRole?: string,
) => {
  if (count <= 0 || actorRole === 'owner') return;

  const actor = `${caller.actorType}:${caller.actorId ?? 'system'}`;
  const total = await countDeletions(tx, actor, count);

  if (total < config.massDelete.alertAt) return;

  const deletion = { caller, actor, total, what, stop: total >= config.massDelete.stopAt };

  if (!deletion.stop) {
    await reportMassDeletion(tx, deletion);

    return;
  }

  // The request is refused (rolled back), but the stop itself is saved.
  await recordStop(deletion);

  throw new HttpError(
    429,
    'MASS_DELETE_STOPPED',
    `Stopped after ${total} deletions in a few minutes: the owners have been told`,
  );
};
