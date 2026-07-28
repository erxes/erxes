import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RESERVE_REMS_ADD } from '../graphql/reserveRemMutations';

export const useReserveRemAdd = (options?: OperationVariables) => {
  const { t } = useTranslation('accounting');
  const [_addReserveRem, { loading }] = useMutation(RESERVE_REMS_ADD, options);

  const addReserveRem = (options?: OperationVariables) => {
    return _addReserveRem({
      ...options,
      onError: (error: Error) => {
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
          description: t('reserve-remainder-created'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['ReserveRems'],
    });
  };

  return {
    addReserveRem,
    loading,
  };
};
