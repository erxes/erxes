import { sendRequest } from '@erxes/api-utils/src';
import { sendCommonMessage } from './messageBroker';

export default {
  constants: {
    actions: [
      {
        type: 'webhooks:webhook.create',
        icon: 'send',
        label: 'Create webhook',
        description: 'Create webhook',
        isAvailable: true
      }
    ]
  },
  receiveActions: async ({ subdomain, data }) => {
    const { action, execution, triggerType } = data;

    const [serviceName] = triggerType.split(':');

    let { target } = execution;
    const { config } = action;

    const { url, method, ...obj } = config || {};

    if (Object.keys(obj).length) {
      const replacedContent = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'automations.replacePlaceHolders',
        data: {
          target,
          config: {}
        },
        isRPC: true,
        defaultValue: {}
      });

      target = replacedContent;
    }

    let response;

    try {
      await sendRequest({
        url,
        method: method || 'POST',
        body: {
          actionType: 'automations.webhook',
          data: target
        }
      }).then(() => {
        response = { url, method: method || 'POST', data: target };
      });
    } catch (error) {
      response = error.message;
    }

    return response;
  }
};
