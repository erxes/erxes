import { IPosDocument } from '@/pos/@types/pos';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const sendPosclientHealthCheck = async ({
  subdomain,
  pos,
}: {
  subdomain: string;
  pos: Pick<IPosDocument, 'token' | 'onServer'>;
}) => {
  const { ALLOW_OFFLINE_POS } = process.env;

  if (
    ![true, 'true', 'True', '1'].includes(ALLOW_OFFLINE_POS || '') ||
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

export const sendPosclientMessage = async (args: {
  subdomain: string;
  pos: Pick<IPosDocument, 'token' | 'onServer'>;
  action: string;
  input: Record<string, unknown>;
  method?: 'query' | 'mutation';
  isAwait?: boolean;
  defaultValue?: unknown;
  throwOnError?: boolean;
}) => {
  const { action, pos, input, subdomain, method } = args;
  let lastAction = action;

  const { ALLOW_OFFLINE_POS } = process.env;

  if (
    [true, 'true', 'True', '1'].includes(ALLOW_OFFLINE_POS || '') &&
    !pos.onServer
  ) {
    lastAction = `posclient:${action}_${pos.token}`;
    input.thirdService = true;

    if (args.isAwait) {
      const response = await sendPosclientHealthCheck(args);
      if (response?.healthy !== 'ok') {
        throw new Error('syncing error not connected posclient');
      }
    }
  }

  const ret = await sendTRPCMessage({
    subdomain,
    pluginName: 'posclient',
    method,
    module: 'posclient',
    action: lastAction,
    input: { ...input, token: pos.token },
    defaultValue: {},
    throwOnError: args.throwOnError,
  });

  return ret;
};
