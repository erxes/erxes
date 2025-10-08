import { UPDATE_CHANNEL_MEMBER } from '@/channels/graphql';
import { IChannelMember } from '@/channels/types';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';

interface IChannelMemberUpdateMutationResponse {
  updateChannelMember: IChannelMember;
}

export const useChannelMemberUpdate = () => {
  const { toast } = useToast();
  const [updateChannelMember, { loading, error }] =
    useMutation<IChannelMemberUpdateMutationResponse>(UPDATE_CHANNEL_MEMBER);
  const handleUpdateChannelMember = (
    options: MutationFunctionOptions<IChannelMemberUpdateMutationResponse, any>,
  ) => {
    updateChannelMember({
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
  return { updateChannelMember: handleUpdateChannelMember, loading, error };
};
