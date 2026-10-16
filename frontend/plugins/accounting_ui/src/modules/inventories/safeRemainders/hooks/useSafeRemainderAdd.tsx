import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { SAFE_REMAINDER_ADD } from '../graphql/safeRemainderAdd';
import { toast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useSafeRemainderAdd = (
  options?: GraphqlMutationOptions<typeof SAFE_REMAINDER_ADD>,
) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [_addSafeRemainder, { loading }] = useMutation(
    SAFE_REMAINDER_ADD,
    options,
  );

  const addSafeRemainder = (
    options?: GraphqlMutationOptions<typeof SAFE_REMAINDER_ADD>,
  ) => {
    return _addSafeRemainder({
      ...options,
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('safe-remainder-created'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['accountingSafeRemainders'],
      update: (_cache, { data }) => {
        const newId = data?.safeRemainderAdd?._id;

        const pathname = newId
          ? `/accounting/inventories/safe-remainder/detail?id=${newId}`
          : '/accounting/inventories/safe-remainders';

        navigate(pathname);
      },
    });
  };

  return {
    addSafeRemainder,
    loading,
  };
};
