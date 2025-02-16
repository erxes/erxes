import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { sendCommonMessage, sendCoreMessage } from '../messageBroker';

export default {
  handleMinutelyJob: async ({ subdomain }) => {
    const NOW_MONTH = new Date().getMonth() + 1;
    const NOW_DAY = new Date().getDate();

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
