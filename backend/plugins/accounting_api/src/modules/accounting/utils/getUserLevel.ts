import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const makeGetUserLevel = (subdomain: string) => async (userId: string) => {
  const user = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'findOne',
    input: { _id: userId, fields: { level: 1 } },
    defaultValue: null,
  });
  return user?.level ?? 0;
};