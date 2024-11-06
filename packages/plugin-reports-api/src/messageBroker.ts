import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "./connectionResolver";

export const setupMessageConsumers = async () => {
  // consumeQueue('reports:send', async ({ data }) => {
  //   Reportss.send(data);
  //   return {
  //     status: 'success'
  //   };
  // });

  consumeRPCQueue("reports:find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Reports.find(data).lean(),
      status: "success"
    };
  });

  consumeRPCQueue("reports:findLast", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Reports.findOne(data).sort({ createdAt: -1 }),
      status: "success"
    };
  });

  consumeRPCQueue(
    "reports:updateMany",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Reports.updateMany(selector, modifier),
        status: "success"
      };
    }
  );
};
//   consumeRPCQueue('reports:find', async ({ data }) => {
//     return {
//       status: 'success',
//       data: await Reportss.find({})
//     };
//   });
// };

// export const sendCommonMessage = async (
//   args: MessageArgs & { serviceName: string }
// ) => {
//   return sendMessage({
//     serviceDiscovery,
//     client,
//     ...args
//   });
// };

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args
  });
};
