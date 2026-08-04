import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const getFieldLabel = (
  field: string,
  fieldConfig: Array<{ field: string; label: string }>,
) => {
  const match = fieldConfig.find((item) => item.field === field);
  return match?.label || field;
};

export async function fetchUsersByIds(
  subdomain: string,
  ids: string[],
): Promise<string[]> {
  if (!ids?.length) {
    return [];
  }

  try {
    const users = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'find',
      input: {
        query: { _id: { $in: ids } },
        fields: { details: 1, email: 1, username: 1 },
      },
      defaultValue: [],
    });

    return users.map((user: any) => {
      if (user.details?.fullName) {
        return user.details.fullName;
      }
      if (user.email) {
        return user.email;
      }
      if (user.username) {
        return user.username;
      }
      return user._id;
    });
  } catch (error) {
    return ids.map((id) => id.toString());
  }
}
