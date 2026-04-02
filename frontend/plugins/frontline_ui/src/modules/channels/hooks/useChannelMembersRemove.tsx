import { REMOVE_CHANNEL_MEMBERS } from '@/channels/graphql';
import {
  useMutation,
  OperationVariables,
  useApolloClient,
} from '@apollo/client';

interface IChannelMemberRemoveMutationResponse {
  channelRemoveMember: { __typename: string } | null;
}

export const useChannelMembersRemove = () => {
  const client = useApolloClient();
  const [singleMemberRemove, { loading }] =
    useMutation<IChannelMemberRemoveMutationResponse>(REMOVE_CHANNEL_MEMBERS);

  const removeMembers = async (
    memberIds: string[],
    channelId: string,
    options?: OperationVariables,
  ) => {
    try {
      await Promise.all(
        memberIds.map((memberId) =>
          singleMemberRemove({
            variables: { channelId, memberId },
          }),
        ),
      );

      options?.onCompleted?.(null as any);

      await client.refetchQueries({
        include: ['GetChannelMembers'],
      });
    } catch (error) {
      if (options?.onError) {
        options.onError(error);
      } else {
        throw error;
      }
    }
  };

  return { removeMembers, loading };
};
