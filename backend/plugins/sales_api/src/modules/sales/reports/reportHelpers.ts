
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const buildUserAggregationResult = async ({
  result,
  subdomain,
  valueField,
}: {
  result: any[];
  subdomain: string;
  valueField: string;
}) => {
  if (!result.length) {
    return {
      labels: [],
      datasets: [{ data: [] }],
    };
  }

  const userIds = result.map((r) => r._id);

  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'users',
    action: 'find',
    input: {
      query: { _id: { $in: userIds } },
    },
    defaultValue: [],
  });

  const userMap = new Map(
    users.map((u: any) => [u._id, u.details?.fullName || u.email]),
  );

  return {
    labels: userIds.map((id) => userMap.get(id) || id),
    datasets: [
      {
        data: result.map((r) => r[valueField]),
      },
    ],
  };
};