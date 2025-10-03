import { generateModels } from '~/connectionResolvers';
import { getEnv, getSaasOrganizations } from 'erxes-api-shared/utils';
import { endOfDay } from 'date-fns'; // эсвэл өөр utility

export const dailyCheckCycles = async () => {
  console.log('daily check cycles is worked');
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const orgs = await getSaasOrganizations();

    for (const org of orgs) {
      if (org.enabledcycles) {
        await endCycle(org.subdomain);
      }
    }

    return 'success';
  } else {
    await endCycle('os');
    return 'success';
  }
};

const endCycle = async (subdomain: string) => {
  console.log('daily check cycles is worked', subdomain);
  const models = await generateModels(subdomain);

  const today = new Date();

  const cycles = await models.Cycle.find({
    isActive: true,
    isCompleted: false,
    endDate: {
      $lte: endOfDay(today),
    },
  });

  if (!cycles || cycles.length === 0) return;

  for (const cycle of cycles) {
    await models.Cycle.endCycle(cycle?._id);
  }
};
