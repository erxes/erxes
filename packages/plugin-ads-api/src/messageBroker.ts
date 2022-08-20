import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  /* consumeRPCQueue("ads:find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Ads.find(data).lean(),
      status: "success",
    };
  });

  consumeRPCQueue("ads:findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Ads.findOne(data).lean(),
      status: "success",
    };
  });

  consumeRPCQueue("ads:createTag", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Ads.createTag(data),
    };
  }); */
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export const sendInboxMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};

export default function() {
  return client;
}
