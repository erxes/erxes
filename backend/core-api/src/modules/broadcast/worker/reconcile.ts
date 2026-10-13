import { zonedDate, zonedDayStart } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { AFTER_SEGMENT_SCHEDULE, armSchedule } from '../utils/schedule';

const HOUR = 60 * 60_000;

// By noon the night's refresh should long be over. The segment's own schedule
// is set elsewhere, so this is a generous bound rather than its exact end.
const MISSED_AFTER_HOURS = 12;

const MISSED_PREFIX = 'Nightly run missed';

/**
 * A campaign that follows its segment has no alarm to lose, only a night that
 * never came. Said once a day on the campaign itself, since nobody watches
 * the worker that should have started it.
 */
const traceMissedNights = async (models: IModels) => {
  const campaigns = await models.EngageMessages.find(
    { isDraft: { $ne: true }, 'scheduleDate.type': AFTER_SEGMENT_SCHEDULE },
    { _id: 1, targetIds: 1, scheduleDate: 1 },
  ).lean();

  let missed = 0;

  for (const campaign of campaigns) {
    const timeZone = campaign.scheduleDate?.timeZone || 'UTC';
    const dayStart = zonedDayStart(zonedDate(new Date(), timeZone), timeZone);
    const since = campaign.scheduleDate?.startDate;

    // Too early to tell, or it began following after last night.
    if (
      Date.now() < dayStart.getTime() + MISSED_AFTER_HOURS * HOUR ||
      (since && new Date(since) > dayStart)
    ) {
      continue;
    }

    const [ran, told] = await Promise.all([
      models.BroadcastRuns.exists({
        engageMessageId: campaign._id,
        scheduledFor: dayStart,
      }),
      models.BroadcastTraces.exists({
        engageMessageId: campaign._id,
        type: 'failure',
        createdAt: { $gte: dayStart },
        message: { $regex: `^${MISSED_PREFIX}` },
      }),
    ]);

    if (ran || told) {
      continue;
    }

    const segment = await models.Segments.findOne(
      { _id: campaign.targetIds?.[0] },
      { status: 1 },
    ).lean();

    await models.BroadcastTraces.createTrace(
      campaign._id,
      'failure',
      `${MISSED_PREFIX}: nothing was sent after last night's segment refresh (segment status: ${
        segment?.status ?? 'removed'
      }).`,
    );

    missed++;
  }

  return missed;
};

/**
 * Puts back any alarm that is no longer in the queue.
 *
 * The queue holds when a campaign goes out; Mongo holds whether it should.
 * Losing Redis therefore loses nothing but the alarms, and this walks the
 * campaigns that should have one and arms it again. Arming is keyed by the
 * moment, so a campaign that is already armed costs nothing.
 *
 * Only moments still ahead are armed. A daily send that was missed while the
 * queue was down stays missed rather than going out a day late, which is the
 * kinder of the two for whoever would have received it.
 */
export const reconcileSchedules = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const campaigns = await models.EngageMessages.find(
    { isDraft: { $ne: true }, scheduleDate: { $exists: true, $ne: null } },
    { _id: 1, scheduleDate: 1 },
  ).lean();

  let rearmed = 0;

  for (const campaign of campaigns) {
    if (await armSchedule(subdomain, campaign)) {
      rearmed++;
    }
  }

  const missed = await traceMissedNights(models);

  return { checked: campaigns.length, rearmed, missed };
};
