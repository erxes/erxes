import { REMOVE_CHANNEL_MEMBER } from '@/channels/graphql';
import { IChannelMember } from '@/channels/types';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface IChannelMemberRemoveMutationResponse {
  removeChannelMember: IChannelMember;
}

export const useChannelMemberRemove = () => {
  const { t } = useTranslation('frontline');
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
  return { removeChannelMember: handleRemoveChannelMember, loading, error };
};
