import { generateModels } from './connectionResolver';
import { sendMessage, ISendMessageArgs } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const sendTagsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'tags',
    ...args
  });
};

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('emailTemplates:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.EmailTemplates.find(data).lean()
    };
  });

  consumeRPCQueue('emailTemplates:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.EmailTemplates.findOne(data)
    };
  });
};

export default function() {
  return client;
}
