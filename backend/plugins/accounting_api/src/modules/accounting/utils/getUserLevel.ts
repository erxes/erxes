import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const makeGetUserLevel = (subdomain: string) => async (userId: string): Promise<number> => {
  try {
    const user = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { _id: userId, fields: { level: 1 } },
      defaultValue: null,
    });
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    return user.level ?? 0;
  } catch (error) {
    // Fail closed – do not reveal internal error details
    throw new Error('Unable to verify user permissions');
  }
};