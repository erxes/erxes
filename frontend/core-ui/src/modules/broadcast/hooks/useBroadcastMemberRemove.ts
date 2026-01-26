import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { BROADCAST_MEMBER_REMOVE } from '../graphql/mutations';
import { BROADCAST_MEMBERS } from '../graphql/queries';

export const useBroadcastMemberRemove = () => {
  const [_removeBroadcastMember, { loading }] = useMutation(
    BROADCAST_MEMBER_REMOVE,
  );

  const removeBroadcastMember = async (
    email: string,
    options?: OperationVariables,
  ) => {
    await _removeBroadcastMember({
      ...options,
      variables: { email },
      refetchQueries: [BROADCAST_MEMBERS],
      onCompleted: () => {
        toast({
          title: 'Email removed successfully',
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { removeBroadcastMember, loading };
};
