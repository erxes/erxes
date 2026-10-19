import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  SalesPosItemsChangePaymentsMutation,
  SalesPosItemsChangePaymentsMutationVariables,
} from '~/gql/graphql';
import { POS_ITEMS_CHANGE_PAYMENTS } from '../../graphql/mutations/posItemsChangePayments';

export const usePosItemChangePayments = (
  options?: MutationFunctionOptions<
    SalesPosItemsChangePaymentsMutation,
    SalesPosItemsChangePaymentsMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const { toast } = useToast();
  const [posItemChangePayments, { loading, error }] = useMutation(
    POS_ITEMS_CHANGE_PAYMENTS,
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
  return { posItemChangePayments, loading, error };
};
