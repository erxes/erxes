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
    const { action, execution } = data;

    const { triggerType } = execution;

    const [serviceName] = triggerType.split(':');

    let { target } = execution;
    const { config } = action;

    const { url, method, specifiedFields } = config || {};

    if (Object.keys(specifiedFields || {}).length) {
      const replacedContent = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'automations.replacePlaceHolders',
        data: {
          target,
          config: specifiedFields
        },
        isRPC: true,
        defaultValue: {}
      });

      target = replacedContent;
    }

    const headers = (config.headers || []).reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    try {
      await sendRequest({
        url,
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: {
          actionType: 'automations.webhook',
          triggerType,
          data: target
        }
      });
      return {
        url,
        method: method || 'POST',
        headers,
        data: target,
        status: 'success'
      };
    } catch (error) {
      return error.message;
    }
  }
};
