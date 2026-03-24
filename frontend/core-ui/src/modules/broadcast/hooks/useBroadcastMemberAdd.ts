import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { BROADCAST_MEMBER_ADD } from '../graphql/mutations';

export const useBroadcastMemberAdd = () => {
  const [_addBroadcastMember, { loading }] = useMutation(BROADCAST_MEMBER_ADD);

  const addBroadcastMember = async (
    email: string,
    options?: OperationVariables,
  ) => {
    await _addBroadcastMember({
      ...options,
      variables: { email },

      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { addBroadcastMember, loading };
};
