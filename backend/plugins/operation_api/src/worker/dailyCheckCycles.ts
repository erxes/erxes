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
      subdomain: 'os',

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

  console.log('timezone', timezone);

  const tzToday = tz(new Date(), timezone);

  console.log('tzToday', tzToday);
  console.log('tzToday.hour', tzToday.hour());

  if (tzToday.hour() !== 0) {
    return;
  }

  const models = await generateModels(subdomain);

  const tzStart = tzToday.clone().startOf('day').subtract(1, 'day');
  const tzEnd = tzToday.clone().endOf('day');

  console.log('tzStart', tzStart);
  console.log('tzEnd', tzEnd);

  console.log('tzEnd.toDate() ', tzEnd.toDate());

  const endCycles = await models.Cycle.find({
    isActive: true,
    isCompleted: false,
    endDate: { $lte: tzEnd.toDate() },
  });

  const endCycleIds: string[] = [];

  if (endCycles?.length) {
    for (const cycle of endCycles) {
      const { _id, endDate } = cycle;

      console.log('endDate', endDate);
      const endDateTz = tz(endDate, timezone);
      console.log('endDateTz', endDateTz);
      if (endDateTz.isBetween(tzStart, tzEnd, null, '(]')) {
        endCycleIds.push(_id);
      }
    }
  }

  console.log('endCycleIds', endCycleIds);

  if (endCycleIds?.length) {
    for (const cycleId of endCycleIds) {
      await models.Cycle.endCycle(cycleId);
    }
  }

  const startCycles = await models.Cycle.find({
    isActive: false,
    isCompleted: false,
    startDate: { $lte: tzEnd.toDate() },
  });

  const startCycleIds: string[] = [];

  if (startCycles?.length) {
    for (const cycle of startCycles) {
      const { _id, startDate } = cycle;

      const startDateTz = tz(startDate, timezone);

      if (startDateTz.isBetween(tzStart, tzEnd, null, '(]')) {
        startCycleIds.push(_id);
      }
    }
  }

  console.log('startCycleIds', startCycleIds);

  if (startCycleIds?.length) {
    for (const cycleId of startCycleIds) {
      await models.Cycle.startCycle(cycleId);
    }
  }
};
