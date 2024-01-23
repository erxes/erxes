import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';

export const initBroker = async () => {
  // consumeQueue('reports:send', async ({ data }) => {
  //   Reportss.send(data);
  //   return {
  //     status: 'success'
  //   };
  // });
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
    serviceName: 'core',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};

export const sendTagsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'tags',
    ...args,
  });
};
