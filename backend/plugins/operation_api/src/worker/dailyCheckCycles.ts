import { Job } from 'bullmq';
import {
  getEnv,
  getSaasOrganizations,
  sendTRPCMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { tz } from 'moment-timezone';
import { generateModels } from '~/connectionResolvers';

export const dailyCheckCycles = async () => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const orgs = await getSaasOrganizations();

    for (const org of orgs) {
      sendWorkerQueue('operations', 'checkCycle').add('checkCycle', {
        subdomain: org.subdomain,
        timezone: org.timezone,
      });
    }

    return 'success';
  } else {
    const timezone = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'configs',
      action: 'getConfig',
      input: {
        code: 'TIMEZONE',
      },
      defaultValue: 'UTC',
    });

    sendWorkerQueue('operations', 'checkCycle').add('checkCycle', {
      subdomain: 'os',
      timezone,
    });
    return 'success';
  }
};

export const checkCycle = async (job: Job) => {
  const { subdomain, timezone = 'UTC' } = job?.data ?? {};

  const tzToday = tz(new Date(), timezone);

  if (tzToday.hour() !== 0) {
    return;
  }

  const models = await generateModels(subdomain);

  const utcStart = tzToday.startOf('day').toDate();
  const utcEnd = tzToday.endOf('day').toDate();

  const endCycles = await models.Cycle.find({
    isActive: true,
    isCompleted: false,
    endDate: { $gte: utcStart, $lte: utcEnd },
  });

  if (endCycles?.length) {
    for (const cycle of endCycles) {
      await models.Cycle.endCycle(cycle?._id);
    }
  }

  const startCycles = await models.Cycle.find({
    isActive: false,
    isCompleted: false,
    startDate: { $gte: utcStart, $lte: utcEnd },
  });

  if (startCycles?.length) {
    for (const cycle of startCycles) {
      await models.Cycle.startCycle(cycle?._id);
    }
  }
};