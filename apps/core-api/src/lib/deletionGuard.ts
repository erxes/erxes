import { type Db, deletionCounters, pluginInstallations, withOrgDetached } from '@erxes/core-db';
import { and, eq, gte, sql } from 'drizzle-orm';
import { config } from '~/config';
import { type Caller, systemCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { log } from '~/lib/log';
import { ownerIds } from '~/modules/audit/alerts';
import { recordAudit } from '~/modules/audit/audit.service';
import { notify } from '~/modules/notifications/notifications.service';

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

  const actorId = caller.actorId ?? 'system';
  const actor = `${caller.actorType}:${actorId}`;
  const bucket = sql`date_bin('5 minutes', now(), timestamptz '2000-01-01')`;

  await tx
    .insert(deletionCounters)
    .values({ orgId: caller.orgId, actor, bucket, count })
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
        eq(deletionCounters.orgId, caller.orgId),
        eq(deletionCounters.actor, actor),
        gte(deletionCounters.bucket, sql`now() - interval '10 minutes'`),
      ),
    );

  if (total < config.massDelete.alertAt) return;

  const who = caller.actorType === 'plugin' ? `The ${caller.actorId} plugin` : 'A team member';
  const stop = total >= config.massDelete.stopAt;

  const report = async (db: Db) => {
    const recipients = await ownerIds(db, caller.orgId);

    await notify(
      db,
      systemCaller(caller.orgId),
      {
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
        entity: { type: caller.actorType, id: actorId },
        data: { actor, total },
        dedupeKey: `mass-deletion:${actor}:${stop ? 'stop' : 'alert'}:${new Date().toISOString().slice(0, 15)}`,
      },
    ).catch((error: unknown) => log.warn('could not tell owners about mass deletion', { error }));
  };

  if (!stop) {
    await report(tx);

    return;
  }

  // The request is refused (rolled back), but the stop itself is saved.
  await withOrgDetached(caller.orgId, async (own) => {
    await report(own);
    await recordAudit(
      own,
      systemCaller(caller.orgId),
      {
        action: 'security.mass_deletion_stopped',
        targetType: caller.actorType,
        targetId: actorId,
        metadata: { total, what },
      },
    );

    if (caller.actorType === 'plugin') {
      await own
        .update(pluginInstallations)
        .set({
          status: 'disabled',
          statusReason: `Suspended: ${total} deletions in a few minutes`,
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(pluginInstallations.orgId, caller.orgId),
            eq(pluginInstallations.plugin, actorId),
          ),
        );
      log.warn('plugin suspended after mass deletion', {
        org: caller.orgId,
        plugin: caller.actorId,
        total,
      });
    }
  });

  throw new HttpError(
    429,
    'MASS_DELETE_STOPPED',
    `Stopped after ${total} deletions in a few minutes: the owners have been told`,
  );
};
