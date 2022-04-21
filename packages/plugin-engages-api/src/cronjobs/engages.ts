import * as schedule from 'node-schedule';
import { IModels } from '../connectionResolver';
import { CAMPAIGN_KINDS } from '../constants';
import { send } from '../engageUtils';
import { IEngageMessageDocument } from '../models/definitions/engages';
// import { debugCrons, debugError } from '../debuggers';

const findMessages = (models: IModels, selector = {}) => {
  return models.EngageMessages.find({
    kind: { $in: [CAMPAIGN_KINDS.AUTO, CAMPAIGN_KINDS.VISITOR_AUTO] },
    isLive: true,
    ...selector
  });
};

const runJobs = async (models: IModels, subdomain: string, messages: IEngageMessageDocument[]) => {
  for (const message of messages) {
    try {
      await send(models, subdomain, message);

      await models.EngageMessages.updateMany(
        { _id: message._id },
        { $set: { lastRunAt: new Date() } }
      );
    } catch (e) {
      // debugError(
      //   `Error occurred when sending campaign "${message.title}" with id ${message._id}`
      // );
    }
  }
};

export const checkEveryMinuteJobs = async (models: IModels, subdomain: string) => {
  const messages = await findMessages(models, { 'scheduleDate.type': 'minute' });

  await runJobs(models, subdomain, messages);
};

const checkPreScheduledJobs = async (models: IModels, subdomain: string) => {
  const messages = await findMessages(models, { 'scheduleDate.type': 'pre' });
  await runJobs(models, subdomain, messages);
};

const checkHourMinuteJobs = async (models: IModels, subdomain: string) => {
  // debugCrons('Checking every hour jobs ....');

  const messages = await findMessages(models, { 'scheduleDate.type': 'hour' });

  // debugCrons(`Found every hour  messages ${messages.length}`);

  await runJobs(models, subdomain, messages);
};

const checkDayJobs = async (models: IModels, subdomain: string) => {
  // debugCrons('Checking every day jobs ....');

  // every day messages ===========
  const everyDayMessages = await findMessages(models, { 'scheduleDate.type': 'day' });
  await runJobs(models, subdomain, everyDayMessages);

  // debugCrons(`Found every day messages ${everyDayMessages.length}`);

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // every nth day messages =======
  const everyNthDayMessages = await findMessages(models, {
    'scheduleDate.type': day.toString()
  });
  await runJobs(models, subdomain, everyNthDayMessages);

  // debugCrons(`Found every nth day messages ${everyNthDayMessages.length}`);

  // every month messages ========
  let everyMonthMessages = await findMessages(models, { 'scheduleDate.type': 'month' });

  everyMonthMessages = everyMonthMessages.filter(message => {
    const { lastRunAt, scheduleDate } = message;

    if (!lastRunAt) {
      return true;
    }

    // ignore if last run month is this month
    if (lastRunAt.getMonth() === month) {
      return false;
    }

    return scheduleDate && scheduleDate.day === day.toString();
  });

  // debugCrons(`Found every month messages ${everyMonthMessages.length}`);

  await runJobs(models, subdomain, everyMonthMessages);

  // every year messages ========
  let everyYearMessages = await findMessages(models, { 'scheduleDate.type': 'year' });

  everyYearMessages = everyYearMessages.filter(message => {
    const { lastRunAt, scheduleDate } = message;

    if (!lastRunAt) {
      return true;
    }

    // ignore if last run year is this year
    if (lastRunAt.getFullYear() === year) {
      return false;
    }

    if (scheduleDate && scheduleDate.month !== month.toString()) {
      return false;
    }

    return scheduleDate && scheduleDate.day === day.toString();
  });

  // debugCrons(`Found every year messages ${everyYearMessages.length}`);

  await runJobs(models, subdomain, everyYearMessages);
};

// // every minute at 1sec
// schedule.scheduleJob('1 * * * * *', async () => {
//   await checkEveryMinuteJobs();
//   await checkPreScheduledJobs();
// });

// // every hour at 10min:10sec
// schedule.scheduleJob('10 10 * * * *', async () => {
//   await checkHourMinuteJobs();
// });

// // every day at 11hour:20min:20sec
// schedule.scheduleJob('20 20 11 * * *', async () => {
//   checkDayJobs(models, subdomain);
// });
