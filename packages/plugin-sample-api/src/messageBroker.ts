
import { consumeQueue, consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { generateModels } from "./connectionResolver";
import type { MessageArgsOmitService } from "@erxes/api-utils/src/core";
import { sendMessage } from "@erxes/api-utils/src/core";

export const setupMessageConsumers = async () => {
  consumeQueue('sample:send', async ({ subdomain, data }) => {

    const models = await generateModels(subdomain);

    models.Samples.send(data);

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('sample:find', async ({ subdomain, data }) => {

    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Samples.find({})
    };
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};