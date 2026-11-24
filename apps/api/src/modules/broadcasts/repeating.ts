import {
  broadcastSchedules,
  broadcasts,
  type Db,
  newId,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, lte, sql } from 'drizzle-orm';
import { orgTimezone } from '~/lib/orgTime';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { defineSchedule } from '~/modules/jobs/jobs';
import { latestDue, nextRunWithin } from './repeatRule';
import { queueStart } from './starting';

const log = logger.child({ component: 'broadcasts' });

type ScheduleRow = typeof broadcastSchedules.$inferSelect;

/**
 * One run of a recurring broadcast: a scheduled copy of its content and
 * audience as they are now, for the latest time due. The unique key on
 * (parent, time) keeps a second tick from making it twice.
 */
const makeRun = async (tx: Db, schedule: ScheduleRow, due: Date) => {
  const timeZone = await orgTimezone(tx);
  const now = new Date();
  const at = latestDue(schedule, timeZone, due, now);

  const [parent] = await tx
    .select()
    .from(broadcasts)
    .where(eq(broadcasts.id, schedule.broadcastId))
    .limit(1);

  // Only a recurring broadcast's schedule makes runs; any other's ends.
  if (parent?.status !== 'recurring') {
    await tx
      .update(broadcastSchedules)
      .set({ state: 'ended', nextRunAt: null, updatedAt: now })
      .where(eq(broadcastSchedules.broadcastId, schedule.broadcastId));

    return;
  }

  const [made] = await tx
    .insert(broadcasts)
    .values({
      id: newId(),
      name: parent.name,
      channel: parent.channel,
      viewId: parent.viewId,
      filter: parent.filter,
      subject: parent.subject,
      preheader: parent.preheader,
      body: parent.body,
      content: parent.content,
      html: parent.html,
      fromName: parent.fromName,
      fromEmail: parent.fromEmail,
      mailConnectionId: parent.mailConnectionId,
      replyTo: parent.replyTo,
      attachmentIds: parent.attachmentIds,
      status: 'scheduled',
      scheduledAt: at,
      parentId: parent.id,
      occurrenceAt: at,
      createdBy: parent.createdBy,
    })
    .onConflictDoNothing()
    .returning({ id: broadcasts.id });

  const runs = schedule.runs + (made ? 1 : 0);
  const next = nextRunWithin({ ...schedule, runs }, timeZone, now);

  await tx
    .update(broadcastSchedules)
    .set({
      runs,
      lastRunAt: made ? at : schedule.lastRunAt,
      ...(next ? { nextRunAt: next } : { state: 'ended', nextRunAt: null }),
      updatedAt: now,
    })
    .where(eq(broadcastSchedules.broadcastId, schedule.broadcastId));

  if (made) await queueStart(tx, schedule.orgId, made.id, at);
};

/**
 * Every minute: recurring broadcasts that are due make their run (claimed, so
 * one server makes it), each in its own savepoint so one failing doesn't stop
 * the others. Returns how many were due.
 */
export const runSchedules = () =>
  withSystem('broadcasts: recurring runs', async (tx) => {
    const due = await tx
      .select()
      .from(broadcastSchedules)
      .where(
        and(eq(broadcastSchedules.state, 'active'), lte(broadcastSchedules.nextRunAt, sql`now()`)),
      )
      .for('update', { skipLocked: true })
      .limit(200);

    await inOrder(due, (schedule) =>
      withOrg(schedule.orgId, (sp) =>
        schedule.nextRunAt ? makeRun(sp, schedule, schedule.nextRunAt) : Promise.resolve(),
      ).catch((error: unknown) =>
        log.error(
          { broadcast: schedule.broadcastId, err: error },
          'could not make a recurring broadcast’s run',
        ),
      ),
    );

    return due.length;
  });

export const broadcastRepeat = defineSchedule({
  queue: 'broadcast.repeat',
  cron: '* * * * *',
  run: runSchedules,
});
