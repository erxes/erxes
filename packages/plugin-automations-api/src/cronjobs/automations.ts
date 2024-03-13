import { sendMessage } from '@erxes/api-utils/src/messageBroker';

export default {
  handleMinutelyJob: async ({ subdomain }) => {
    sendMessage('automations:trigger', {
      subdomain,
      data: {
        actionType: 'waiting',
      },
    });
  },
};
