import { UPDATE_CHANNEL_MEMBER } from '@/channels/graphql';
import { IChannelMember } from '@/channels/types';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface IChannelMemberUpdateMutationResponse {
  updateChannelMember: IChannelMember;
}

export const useChannelMemberUpdate = () => {
  const { t } = useTranslation('frontline');
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
        toast({ title: t('success') });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['GetChannelMembers'],
    });
  };
  return { updateChannelMember: handleUpdateChannelMember, loading, error };
};
