import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RE_CALC_REMAINDERS } from '../graphql';

export const useReCalcRemainders = (options?: OperationVariables) => {
  const { t } = useTranslation('accounting');
  const [_addSafeRemainder, { loading }] = useMutation(
    RE_CALC_REMAINDERS,
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
          description: t('re-calced-successfully'),
        });
        options?.onCompleted();
      },
      refetchQueries: ['ProductsRemainderMain'],
    });
  };

  return {
    addSafeRemainder,
    loading,
  };
};
