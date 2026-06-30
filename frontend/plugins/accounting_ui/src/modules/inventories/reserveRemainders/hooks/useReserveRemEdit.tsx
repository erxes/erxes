import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RESERVE_REM_EDIT } from '../graphql/reserveRemMutations';

export const useReserveRemEdit = () => {
  const { t } = useTranslation('accounting');
  const [_editReserveRem, { loading }] = useMutation(RESERVE_REM_EDIT);

  const editReserveRem = (options: OperationVariables) => {
    return _editReserveRem({
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
          description: t('reserve-remainder-updated'),
        });
        options?.onCompleted?.(data);
      },
    });
  };

  return {
    editReserveRem,
    loading,
  };
};
