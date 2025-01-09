import { generateModels, IModels } from '../connectionResolver';
import { CAMPAIGN_KINDS } from '../constants';
import { send } from '../engageUtils';
import { IEngageMessageDocument } from '../models/definitions/engages';
import { debugInfo, debugError } from '@erxes/api-utils/src/debuggers';
import { getOrganizations } from '@erxes/api-utils/src/saas/saas';
import { getEnv } from '@erxes/api-utils/src';

interface IParams {
  callback1: any;
  callback2?: any;
  action: string;
}

const findMessages = (models: IModels, selector = {}) => {
  return models.EngageMessages.find({
    kind: { $in: [CAMPAIGN_KINDS.AUTO, CAMPAIGN_KINDS.VISITOR_AUTO] },
    isLive: true,
    ...selector,
  });
};

const runJobs = async (
  models: IModels,
  subdomain: string,
  messages: IEngageMessageDocument[],
) => {
  for (const message of messages) {
    try {
      await send(models, subdomain, message);

      await models.EngageMessages.updateMany(
        { _id: message._id },
        { $set: { lastRunAt: new Date() } },
      );
    } catch (e) {
      debugError(
        `Error occurred when sending campaign "${message.title}" with id ${message._id}`,
      );
    }
  }
};

const checkEveryMinuteJobs = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const messages = await findMessages(models, {
    'scheduleDate.type': 'minute',
  });

  await runJobs(models, subdomain, messages);
};

const checkPreScheduledJobs = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const messages = await findMessages(models, { 'scheduleDate.type': 'pre' });

  await runJobs(models, subdomain, messages);
};

const checkHourMinuteJobs = async (subdomain: string) => {
  debugInfo('Checking every hour jobs ....');

  const models = await generateModels(subdomain);
  const messages = await findMessages(models, { 'scheduleDate.type': 'hour' });

  debugInfo(`Found every hour  messages ${messages.length}`);

  await runJobs(models, subdomain, messages);
};

const checkDayJobs = async (subdomain: string) => {
  debugInfo('Checking every day jobs ....');

  const models = await generateModels(subdomain);
  // every day messages ===========
  const everyDayMessages = await findMessages(models, {
    'scheduleDate.type': 'day',
  });
  await runJobs(models, subdomain, everyDayMessages);

  debugInfo(`Found every day messages ${everyDayMessages.length}`);

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // every nth day messages =======
  const everyNthDayMessages = await findMessages(models, {
    'scheduleDate.type': day.toString(),
  });
  await runJobs(models, subdomain, everyNthDayMessages);

  debugInfo(`Found every nth day messages ${everyNthDayMessages.length}`);

  // every month messages ========
  let everyMonthMessages = await findMessages(models, {
    'scheduleDate.type': 'month',
  });

  everyMonthMessages = everyMonthMessages.filter((message) => {
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

  debugInfo(`Found every month messages ${everyMonthMessages.length}`);

  await runJobs(models, subdomain, everyMonthMessages);

  // every year messages ========
  let everyYearMessages = await findMessages(models, {
    'scheduleDate.type': 'year',
  });

  everyYearMessages = everyYearMessages.filter((message) => {
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

  debugInfo(`Found every year messages ${everyYearMessages.length}`);

  await runJobs(models, subdomain, everyYearMessages);
};

const loopOrganizations = async ({ callback1, callback2, action }: IParams) => {
  const VERSION = getEnv({ name: 'VERSION'});

  if (VERSION && VERSION === 'saas') {
    const organizations = await getOrganizations();

    for (const org of organizations) {
      if (org.subdomain.length === 0) {
        continue;
      }
      console.log(
        `Running cron for organization [${org.subdomain}]: ${action}`,
      );

      if (callback1) {
        await callback1(org.subdomain);
      }
      if (callback2) {
        await callback2(org.subdomain);
      }
    }
  } else {
    if (callback1) {
      await callback1('os');
    }
    if (callback2) {
      await callback2('os');
    }
  }
};

export default {
  handleMinutelyJob: async ({ data }) => {
    await loopOrganizations({
      callback1: checkEveryMinuteJobs,
      callback2: checkPreScheduledJobs,
      action: data && data.action,
    });
  },
  handleHourlyJob: async ({ data }) => {
    await loopOrganizations({
      callback1: checkHourMinuteJobs,
      action: data && data.action,
    });
  },
  handleDailyJob: async ({ data }) => {
    await loopOrganizations({
      callback1: checkDayJobs,
      action: data && data.action,
    });
  },
};
