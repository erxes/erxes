import { REMOVE_CHANNEL_MEMBER } from '@/channels/graphql';
import { IChannelMember } from '@/channels/types';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';

interface IChannelMemberRemoveMutationResponse {
  removeChannelMember: IChannelMember;
}

// Hook for removing channel members
export const useChannelMemberRemove = () => {
  const { toast } = useToast();
  const [removeChannelMember, { loading, error }] =
    useMutation<IChannelMemberRemoveMutationResponse>(REMOVE_CHANNEL_MEMBER);
  const handleRemoveChannelMember = (
    options: MutationFunctionOptions<IChannelMemberRemoveMutationResponse, any>,
  ) => {
    removeChannelMember({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
        toast({ title: 'Success!' });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['GetChannelMembers'],
    });
  };
  return { removeChannelMember: handleRemoveChannelMember, loading, error };
};
