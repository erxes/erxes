import { IPosDocument } from '@/pos/@types/pos';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const sendPosclientHealthCheck = async ({
  subdomain,
  pos,
}: {
  subdomain: string;
  pos: IPosDocument;
}) => {
  const { ALL_AUTO_INIT } = process.env;

  if (
    [true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') ||
    pos.onServer
  ) {
    return { healthy: 'ok' };
  }
  sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'pos',
    action: 'health_check',
    input: { channelToken: pos.token },
    defaultValue: { healthy: 'no' },
  });
};

interface SendPosclientMessageArgs {
  action: string;
  pos: IPosDocument;
  data: Record<string, any>;
  subdomain: string;
  isRPC?: boolean;
  isMQ?: boolean;
}

export const sendPosclientMessage = async (args: SendPosclientMessageArgs) => {
  const { action, pos, data, subdomain } = args;
  let lastAction = action;
  let serviceName = 'posclient';

  const { ALL_AUTO_INIT } = process.env;

  // Create a mutable copy of data to avoid modifying the original
  const messageData = { ...data };

  if (
    ![true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') &&
    !pos.onServer
  ) {
    lastAction = `posclient:${action}_${pos.token}`;
    serviceName = '';
    messageData.thirdService = true;
    args.isMQ = true;

    if (args.isRPC) {
      const response = await sendPosclientHealthCheck({ subdomain, pos });
      if (!response || response.healthy !== 'ok') {
        throw new Error('syncing error not connected posclient');
      }
    }
  }
  messageData.token = pos.token;

  const ret = await sendTRPCMessage({
    subdomain,
    pluginName: 'posclient',
    method: lastAction === 'crudData' ? 'mutation' : 'query',
    module: 'posclient',
    action: lastAction,
    input: messageData,
    defaultValue: {},
  });

  return ret;
};
