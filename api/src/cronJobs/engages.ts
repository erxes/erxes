import * as schedule from 'node-schedule';
import { send } from '../data/resolvers/mutations/engageUtils';
import { MESSAGE_KINDS } from '../data/constants';
import { EngageMessages } from '../db/models';
import { METHODS } from '../db/models/definitions/constants';
import { IEngageMessageDocument } from '../db/models/definitions/engages';
import { debugCrons } from '../debuggers';
import { EngagesAPI } from '../data/dataSources';

const findMessages = (selector = {}) => {
  return EngageMessages.find({
    kind: { $in: [MESSAGE_KINDS.AUTO, MESSAGE_KINDS.VISITOR_AUTO] },
    isLive: true,
    ...selector
  });
};

const runJobs = async (messages: IEngageMessageDocument[]) => {
  const dataSources = { EngagesAPI: new EngagesAPI() };
  const configs = (await dataSources.EngagesAPI.engagesConfigDetail()) || [];

  for (const message of messages) {
    if (message.kind === MESSAGE_KINDS.AUTO && message.method === METHODS.SMS) {
      const smsConfig = configs.find(c => c.code === 'smsLimit');
      const limit =
        smsConfig && smsConfig.value ? parseInt(smsConfig.value, 10) : 0;

      await send(message, limit);
    } else {
      await send(message);
    }
  }
};

const checkEveryMinuteJobs = async () => {
  const messages = await findMessages({ 'scheduleDate.type': 'minute' });
  await runJobs(messages);
};

const checkPreScheduledJobs = async () => {
  const messages = await findMessages({ 'scheduleDate.type': 'pre' });
  await runJobs(messages);
};

const checkHourMinuteJobs = async () => {
  debugCrons('Checking every hour jobs ....');

  const messages = await findMessages({ 'scheduleDate.type': 'hour' });

  debugCrons(`Found every hour  messages ${messages.length}`);

  await runJobs(messages);
};

const checkDayJobs = async () => {
  debugCrons('Checking every day jobs ....');

  // every day messages ===========
  const everyDayMessages = await findMessages({ 'scheduleDate.type': 'day' });
  await runJobs(everyDayMessages);

  debugCrons(`Found every day messages ${everyDayMessages.length}`);

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // every nth day messages =======
  const everyNthDayMessages = await findMessages({
    'scheduleDate.type': day.toString()
  });
  await runJobs(everyNthDayMessages);

  debugCrons(`Found every nth day messages ${everyNthDayMessages.length}`);

  // every month messages ========
  let everyMonthMessages = await findMessages({ 'scheduleDate.type': 'month' });

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

  debugCrons(`Found every month messages ${everyMonthMessages.length}`);

  await runJobs(everyMonthMessages);

  await EngageMessages.updateMany(
    { _id: { $in: everyMonthMessages.map(m => m._id) } },
    { $set: { lastRunAt: new Date() } }
  );

  // every year messages ========
  let everyYearMessages = await findMessages({ 'scheduleDate.type': 'year' });

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

  debugCrons(`Found every year messages ${everyYearMessages.length}`);

  await runJobs(everyYearMessages);

  await EngageMessages.updateMany(
    { _id: { $in: everyYearMessages.map(m => m._id) } },
    { $set: { lastRunAt: new Date() } }
  );
};

// every minute at 1sec
schedule.scheduleJob('1 * * * * *', async () => {
  await checkEveryMinuteJobs();
  await checkPreScheduledJobs();
});

// every hour at 10min:10sec
schedule.scheduleJob('10 10 * * * *', async () => {
  await checkHourMinuteJobs();
});

// every day at 11hour:20min:20sec
schedule.scheduleJob('20 20 11 * * *', async () => {
  checkDayJobs();
});
