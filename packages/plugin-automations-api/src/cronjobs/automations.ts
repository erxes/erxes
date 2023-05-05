import messageBroker from '../messageBroker';

export default {
  handleMinutelyJob: async ({ subdomain }) => {
    await messageBroker().sendMessage('automations:trigger', {
      subdomain,
      data: {
        actionType: 'waiting'
      }
    });
  }
};
