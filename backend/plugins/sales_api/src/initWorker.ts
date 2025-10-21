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
  // return await sendMessage({
  //   subdomain,
  //   isRPC: true,
  //   isMQ: true,
  //   serviceName: "",
  //   action: `posclient:health_check_${pos.token}`,
  //   data: { token: pos.token, thirdService: true },
  //   timeout: 1000,
  //   defaultValue: { healthy: "no" }
  // });
};

export const sendPosclientMessage = async (subdomain: string, args: any) => {
export const sendPosclientMessage = async (subdomain: string, args: any) => {
  const { action, pos, data } = args;
  let lastAction = action;
  let serviceName = 'posclient';

  const { ALL_AUTO_INIT } = process.env;

  if (
    ![true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') &&
    !pos.onServer
  ) {
    lastAction = `posclient:${action}_${pos.token}`;
    serviceName = '';
    args.data.thirdService = true;
    args.isMQ = true;

    if (args.isRPC) {
      const response = await sendPosclientHealthCheck(args);
      if (!response || response.healthy !== 'ok') {
        throw new Error('syncing error not connected posclient');
      }
    }
  }
  args.data.token = pos.token;

  return await sendTRPCMessage({
    subdomain,

  const ret = await sendTRPCMessage({
    subdomain,

    pluginName: 'posclient',
    method: lastAction === 'crudData' ? 'mutation' : 'query',
    module: 'posclient',
    action: lastAction,
    input: { ...data, token: pos.token },
    defaultValue: {},
  });
};
