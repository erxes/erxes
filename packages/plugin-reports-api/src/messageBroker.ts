// import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
// import { serviceDiscovery } from './configs';
// import { Reportss } from './models';

import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

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
//   args: ISendMessageArgs & { serviceName: string }
// ) => {
//   return sendMessage({
//     serviceDiscovery,
//     client,
//     ...args
//   });
// };

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
