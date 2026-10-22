import { UPDATE_CHANNEL_MEMBER } from '@/channels/graphql';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  ChannelUpdateMemberMutation,
  ChannelUpdateMemberMutationVariables,
} from '~/gql/graphql';

export const useChannelMemberUpdate = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { toast } = useToast();
  const [updateChannelMember, { loading, error }] = useMutation(
    UPDATE_CHANNEL_MEMBER,
  );
  const handleUpdateChannelMember = (
    options: MutationFunctionOptions<
      ChannelUpdateMemberMutation,
      ChannelUpdateMemberMutationVariables
    >,
  ) => {
    updateChannelMember({
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
  return { updateChannelMember: handleUpdateChannelMember, loading, error };
};
