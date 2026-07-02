import { OperationVariables, useMutation } from '@apollo/client';
import { SAFE_REMAINDER_ADD } from '../graphql/safeRemainderAdd';
import { toast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useSafeRemainderAdd = (options?: OperationVariables) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [_addSafeRemainder, { loading }] = useMutation(
    SAFE_REMAINDER_ADD,
    options,
  );

  const addSafeRemainder = (options?: OperationVariables) => {
    return _addSafeRemainder({
      ...options,
      onError: (error: Error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('safe-remainder-created'),
        });
        options?.onCompleted();
      },
      refetchQueries: ['SafeRemainders'],
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
