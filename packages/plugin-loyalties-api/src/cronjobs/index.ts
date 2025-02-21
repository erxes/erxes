import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { sendCommonMessage, sendCoreMessage } from '../messageBroker';

export default {
  handleDailyJob: async ({ subdomain }) => {
    const NOW = new Date();
    const NOW_MONTH = NOW.getMonth() + 1;
    const NOW_DAY = NOW.getDate();

    const customers = await sendCoreMessage({
      subdomain,
      action: 'customers.find',
      data: {
        $expr: {
          $and: [
            { $eq: [{ $month: '$birthDate' }, NOW_MONTH] },
            { $eq: [{ $dayOfMonth: '$birthDate' }, NOW_DAY] },
          ],
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    const isAutomationsAvailable = isEnabled('automations');

    if (customers.length && isAutomationsAvailable) {
      await sendCommonMessage({
        subdomain,
        serviceName: 'automations',
        action: 'trigger',
        data: {
          type: 'loyalties:promotion',
          targets: customers,
        },
        defaultValue: [],
      });
    }
  },
};
