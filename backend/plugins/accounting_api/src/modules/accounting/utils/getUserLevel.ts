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
    // Log the error and fail closed
    console.error(`Failed to fetch level for user ${userId}:`, error);
    throw new Error(`Unable to verify user permissions: ${error.message}`);
  }
};