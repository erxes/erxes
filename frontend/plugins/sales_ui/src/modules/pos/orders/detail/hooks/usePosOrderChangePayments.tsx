import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  SalesPosOrderChangePaymentsMutation,
  SalesPosOrderChangePaymentsMutationVariables,
} from '~/gql/graphql';
import { POS_ORDER_CHANGE_PAYMENTS } from '../graphql/mutations/posOrderChangePayments';

export const usePosOrderChangePayments = (
  options?: MutationFunctionOptions<
    SalesPosOrderChangePaymentsMutation,
    SalesPosOrderChangePaymentsMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const { toast } = useToast();
  const [posOrderChangePayments, { loading, error }] = useMutation(
    POS_ORDER_CHANGE_PAYMENTS,
    {
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      ...options,
    },
  );
  return { posOrderChangePayments, loading, error };
};
