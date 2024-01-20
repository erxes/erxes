import { MessageArgs, MessageArgsOmitService, sendMessage } from '@erxes/api-utils/src/core';
import { Bichils } from './models';
import { consumeQueue, consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';


export const initBroker = async () => {

  consumeQueue('bichil:send', async ({ data }) => {
    Bichils.send(data);

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('bichil:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Bichils.find({})
    };
  });
};

export const sendCoreMessage = async (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};

export const sendCommonMessage = async (
  args: MessageArgs
) => {
  return sendMessage({
    ...args
  });
};