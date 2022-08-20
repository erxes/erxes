import { getEnv, sendRequest } from '@erxes/api-utils/src';
import { IModels } from './connectionResolver';
import { serviceDiscovery } from './configs';
import { sendCommonMessage } from './messageBroker';

export const send = async (
  models: IModels,
  subdomain: string,
  { action, type, params }: { action: string; type: string; params: any }
) => {
  const webhooks = await models.Webhooks.find({
    actions: { $elemMatch: { action, type } }
  });

  if (!webhooks) {
    return;
  }

  let data = params;

  for (const webhook of webhooks) {
    if (!webhook.url || webhook.url.length === 0) {
      continue;
    }

    if (action === 'delete') {
      data = { type, object: { _id: params.object._id } };
    }

    const { slackContent, content, url } = await prepareWebhookContent(
      subdomain,
      type,
      action,
      data
    );

    sendRequest({
      url: webhook.url,
      headers: {
        'Erxes-token': webhook.token || ''
      },
      method: 'post',
      body: {
        data: JSON.stringify(data),
        text: slackContent,
        content,
        url,
        action,
        type
      }
    })
      .then(async () => {
        await models.Webhooks.updateStatus(webhook._id, 'available');
      })
      .catch(async () => {
        await models.Webhooks.updateStatus(webhook._id, 'unavailable');
      });
  }
};

const prepareWebhookContent = async (subdomain: string, type, action, data) => {
  const [serviceName, contentType] = type.split(':');

  let actionText = 'created';
  let url;
  let content = '';

  switch (action) {
    case 'update':
      actionText = 'has been updated';
      break;
    case 'delete':
      actionText = 'has been deleted';
      break;
    default:
      actionText = 'has been created';
      break;
  }

  const isEnabled = await serviceDiscovery.isEnabled(serviceName);

  if (isEnabled) {
    const service = await serviceDiscovery.getService(serviceName, true);

    const meta = service.config?.meta || {};

    if (meta && meta.webhooks && meta.webhooks.getInfoAvailable) {
      const response = await sendCommonMessage({
        subdomain,
        action: 'webhooks.getInfo',
        serviceName,
        data: {
          data,
          actionText,
          contentType,
          action
        },
        isRPC: true
      });

      url = response.url;
      content = response.content;
    }
  }

  url = `${getEnv({ name: 'DOMAIN' })}${url}`;

  let slackContent = '';

  if (action !== 'delete') {
    slackContent = `<${url}|${content}>`;
  }

  return { slackContent, content, url };
};
