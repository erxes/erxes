import { OperationVariables, useMutation } from '@apollo/client';
import { BROADCAST_REMOVE } from '../graphql/mutations';
import { BROADCAST_MESSAGES } from '../graphql/queries';
import { useBroadcastMessageVariables } from './useBroadcastMessages';

export const useBroadcastRemove = () => {
  const variables = useBroadcastMessageVariables();
  const [_removeBroadcast, { loading }] = useMutation(BROADCAST_REMOVE);

  const removeBroadcast = async (
    broadcastIds: string[],
    options?: OperationVariables,
  ) => {
    await _removeBroadcast({
      ...options,
      variables: { _ids: broadcastIds, ...options?.variables },
      refetchQueries: [BROADCAST_MESSAGES],
      update: (cache) => {
        cache.updateQuery(
          {
            query: BROADCAST_MESSAGES,
            variables: variables,
          },
          ({ engageMessages }) => {
            const updatedBroadcasts = engageMessages.list.filter(
              (broadcast: any) =>
                !options?.variables?.broadcastIds.includes(broadcast._id),
            );

            return {
              engageMessages: {
                ...engageMessages,
                list: updatedBroadcasts,
                totalCount: engageMessages.totalCount - broadcastIds.length,
              },
            };
          },
        );
      },
    });
  };

  return { removeBroadcast, loading };
};
