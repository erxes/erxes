import { generateModels, IModels } from '../connectionResolver';
import { CAMPAIGN_KINDS } from '../constants';
import { send } from '../engageUtils';
import { IEngageMessageDocument } from '../models/definitions/engages';
import { debugEngages, debugError } from '../debuggers';

const findMessages = (models: IModels, selector = {}) => {
  return models.EngageMessages.find({
    kind: { $in: [CAMPAIGN_KINDS.AUTO, CAMPAIGN_KINDS.VISITOR_AUTO] },
    isLive: true,
    ...selector
  });
};

const runJobs = async (
  models: IModels,
  subdomain: string,
  messages: IEngageMessageDocument[]
) => {
  for (const message of messages) {
    try {
      await send(models, subdomain, message);

      await models.EngageMessages.updateMany(
        { _id: message._id },
        { $set: { lastRunAt: new Date() } }
      );
    } catch (e) {
      debugError(
        `Error occurred when sending campaign "${message.title}" with id ${message._id}`
      );
    }
  }
};

const checkEveryMinuteJobs = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const messages = await findMessages(models, {
    'scheduleDate.type': 'minute'
  });

  await runJobs(models, subdomain, messages);
};

const checkPreScheduledJobs = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const messages = await findMessages(models, { 'scheduleDate.type': 'pre' });

  await runJobs(models, subdomain, messages);
};

const checkHourMinuteJobs = async (subdomain: string) => {
  debugEngages('Checking every hour jobs ....');

  const models = await generateModels(subdomain);
  const messages = await findMessages(models, { 'scheduleDate.type': 'hour' });

  debugEngages(`Found every hour  messages ${messages.length}`);

  await runJobs(models, subdomain, messages);
};

const checkDayJobs = async (subdomain: string) => {
  debugEngages('Checking every day jobs ....');

  const models = await generateModels(subdomain);
  // every day messages ===========
  const everyDayMessages = await findMessages(models, {
    'scheduleDate.type': 'day'
  });
  await runJobs(models, subdomain, everyDayMessages);

  debugEngages(`Found every day messages ${everyDayMessages.length}`);

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // every nth day messages =======
  const everyNthDayMessages = await findMessages(models, {
    'scheduleDate.type': day.toString()
  });
  await runJobs(models, subdomain, everyNthDayMessages);

  debugEngages(`Found every nth day messages ${everyNthDayMessages.length}`);

  // every month messages ========
  let everyMonthMessages = await findMessages(models, {
    'scheduleDate.type': 'month'
  });

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

  debugEngages(`Found every month messages ${everyMonthMessages.length}`);

  await runJobs(models, subdomain, everyMonthMessages);

  // every year messages ========
  let everyYearMessages = await findMessages(models, {
    'scheduleDate.type': 'year'
  });

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

  debugEngages(`Found every year messages ${everyYearMessages.length}`);

  await runJobs(models, subdomain, everyYearMessages);
};

export default {
  handleMinutelyJob: async (subdomain: string) => {
    await checkEveryMinuteJobs(subdomain);
    await checkPreScheduledJobs(subdomain);
  },
  handleHourlyJob: async (subdomain: string) => {
    await checkHourMinuteJobs(subdomain);
  },
  handleDailyJob: async (subdomain: string) => {
    await checkDayJobs(subdomain);
  }
};
