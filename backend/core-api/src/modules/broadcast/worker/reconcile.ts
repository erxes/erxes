import { generateModels } from '~/connectionResolvers';
import { armSchedule } from '../utils/schedule';

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

  return { checked: campaigns.length, rearmed };
};
