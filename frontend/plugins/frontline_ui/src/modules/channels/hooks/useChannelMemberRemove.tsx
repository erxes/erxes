import { REMOVE_CHANNEL_MEMBER } from '@/channels/graphql';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  ChannelRemoveMemberMutation,
  ChannelRemoveMemberMutationVariables,
} from '~/gql/graphql';

export const useChannelMemberRemove = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { toast } = useToast();
  const [removeChannelMember, { loading, error }] = useMutation(
    REMOVE_CHANNEL_MEMBER,
  );
  const handleRemoveChannelMember = (
    options: MutationFunctionOptions<
      ChannelRemoveMemberMutation,
      ChannelRemoveMemberMutationVariables
    >,
  ) => {
    removeChannelMember({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
        toast({ title: t('success', 'Success!') });
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['GetChannelMembers'],
    });
  };
  return { removeChannelMember: handleRemoveChannelMember, loading, error };
};
