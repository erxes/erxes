import * as moment from 'moment';
import * as schedule from 'node-schedule';
import { send } from '../data/resolvers/mutations/engageUtils';
import { EngageMessages } from '../db/models';
import { IEngageMessageDocument, IScheduleDate } from '../db/models/definitions/engages';

interface IEngageSchedules {
  id: string;
  job: any;
}

// Track runtime cron job instances
export const ENGAGE_SCHEDULES: IEngageSchedules[] = [];

/**
 * Update or Remove selected engage message
 * @param _id - Engage id
 * @param update - Action type
 */
export const updateOrRemoveSchedule = async (engageMessageId: string, update?: boolean) => {
  const selectedIndex = ENGAGE_SCHEDULES.findIndex(engage => engage.id === engageMessageId);

  if (selectedIndex === -1) {
    return;
  }

  // Remove selected job instance and update tracker
  ENGAGE_SCHEDULES[selectedIndex].job.cancel();
  ENGAGE_SCHEDULES.splice(selectedIndex, 1);

  if (!update) {
    return;
  }

  const message = await EngageMessages.findOne({ _id: engageMessageId });

  if (!message) {
    return;
  }

  return createSchedule(message);
};

/**
 * Create cron job for an engage message
 */
export const createSchedule = (message: IEngageMessageDocument) => {
  const { scheduleDate } = message;

  if (scheduleDate) {
    const rule = createScheduleRule(scheduleDate);

    const job = schedule.scheduleJob(rule, () => {
      send(message);
    });

    // Collect cron job instances
    ENGAGE_SCHEDULES.push({ id: message._id, job });
  }
};

/**
 * Create cron job schedule rule
 */
export const createScheduleRule = (scheduleDate: IScheduleDate) => {
  if (!scheduleDate || (!scheduleDate.type && !scheduleDate.time)) {
    return '0 45 23 * * *';
  }

  if (!scheduleDate.time) {
    return '0 45 23 * * *';
  }

  const time = moment(new Date(scheduleDate.time));

  const hour = time.hour() || '*';
  const minute = time.minute() || '0';
  const month = scheduleDate.month || '*';

  let dayOfWeek = '*';
  let day: string | number = '*';

  // Schedule type day of week [0-6]
  if (scheduleDate.type && scheduleDate.type.length === 1) {
    dayOfWeek = scheduleDate.type || '*';
  }

  if (scheduleDate.type === 'month' || scheduleDate.type === 'year') {
    day = scheduleDate.day || '*';
  }

  /*
      *    *    *    *    *    *
    ┬    ┬    ┬    ┬    ┬    ┬
    │    │    │    │    │    │
    │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
    │    │    │    │    └───── month (1 - 12)
    │    │    │    └────────── day of month (1 - 31)
    │    │    └─────────────── hour (0 - 23)
    │    └──────────────────── minute (0 - 59)
    └───────────────────────── second (0 - 59, OPTIONAL)
  */

  return `${minute} ${hour} ${day} ${month} ${dayOfWeek}`;
};

const initCronJob = async () => {
  const messages = await EngageMessages.find({
    kind: { $in: ['auto', 'visitorAuto'] },
    isLive: true,
  });

  for (const message of messages) {
    createSchedule(message);
  }
};

initCronJob();
