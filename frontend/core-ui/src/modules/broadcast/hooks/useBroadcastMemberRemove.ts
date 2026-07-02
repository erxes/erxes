import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BROADCAST_MEMBER_REMOVE } from '../graphql/mutations';
import { BROADCAST_MEMBERS } from '../graphql/queries';

export const useBroadcastMemberRemove = () => {
  const { t } = useTranslation('broadcasts');
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
          title: t('verified-email.removed', 'Email removed successfully'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { removeBroadcastMember, loading };
};
