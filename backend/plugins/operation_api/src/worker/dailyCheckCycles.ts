import { Job } from 'bullmq';
import {
  getEnv,
  getSaasOrganizationsByFilter,
  sendTRPCMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { tz } from 'moment-timezone';
import { generateModels } from '~/connectionResolvers';

export const dailyCheckCycles = async () => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const orgs = await getSaasOrganizationsByFilter({ cycleEnabled: true });

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

  // LOG: Script Execution Context
  console.log(
    `[Cycle Check: ${subdomain}] Running at ${tzToday.format(
      'YYYY-MM-DD HH:mm:ss',
    )} (${timezone})`,
  );

  if (tzToday.hour() !== 0) {
    return;
  }

  const models = await generateModels(subdomain);

  // Define clear boundaries
  const yesterdayStart = tzToday.clone().subtract(1, 'day').startOf('day');
  const yesterdayEnd = tzToday.clone().subtract(1, 'day').endOf('day');
  const todayStart = tzToday.clone().startOf('day');
  const todayEnd = tzToday.clone().endOf('day');

  console.log(`[Cycle Check: ${subdomain}] Logic Windows: 
    Closing Cycles ending between: [${yesterdayStart.format()}] AND [${yesterdayEnd.format()}]
    Starting Cycles starting between: [${todayStart.format()}] AND [${todayEnd.format()}]`);

  // --- ENDING CYCLES ---
  const endCycles = await models.Cycle.find({
    isActive: true,
    isCompleted: false,
    endDate: { $lte: todayEnd.toDate() },
  });

  const endCycleIds: string[] = [];
  for (const cycle of endCycles) {
    const endDateTz = tz(cycle.endDate, timezone);
    const isMatch = endDateTz.isBetween(
      yesterdayStart,
      yesterdayEnd,
      null,
      '[]',
    );

    console.log(
      `[DEBUG END] Cycle: "${
        cycle.name
      }" | EndDate(UTC): ${cycle.endDate.toISOString()} | EndDate(Local): ${endDateTz.format()} | Match: ${isMatch}`,
    );

    if (isMatch) endCycleIds.push(cycle._id);
  }

  if (endCycleIds.length > 0) {
    console.log(`[ACTION] Ending ${endCycleIds.length} cycles...`);
    for (const cycleId of endCycleIds) {
      await models.Cycle.endCycle(cycleId);
    }
  }

  // --- STARTING CYCLES ---
  const startCycles = await models.Cycle.find({
    isActive: false,
    isCompleted: false,
    startDate: { $lte: todayEnd.toDate() },
  });

  const startCycleIds: string[] = [];
  for (const cycle of startCycles) {
    const startDateTz = tz(cycle.startDate, timezone);
    const isMatch = startDateTz.isBetween(todayStart, todayEnd, null, '[]');

    console.log(
      `[DEBUG START] Cycle: "${
        cycle.name
      }" | StartDate(UTC): ${cycle.startDate.toISOString()} | StartDate(Local): ${startDateTz.format()} | Match: ${isMatch}`,
    );

    if (isMatch) startCycleIds.push(cycle._id);
  }

  if (startCycleIds.length > 0) {
    console.log(`[ACTION] Starting ${startCycleIds.length} cycles...`);
    for (const cycleId of startCycleIds) {
      await models.Cycle.startCycle(cycleId);
    }
  }

  console.log(`[Cycle Check: ${subdomain}] Finished.`);
};
