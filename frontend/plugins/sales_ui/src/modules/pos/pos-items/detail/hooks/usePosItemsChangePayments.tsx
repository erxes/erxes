import { useToast } from 'erxes-ui';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { POS_ITEMS_CHANGE_PAYMENTS } from '../../graphql/mutations/posItemsChangePayments';
import { useTranslation } from 'react-i18next';

export const usePosItemChangePayments = (
  options?: MutationFunctionOptions<{
    posItemChangePayments: { _id: string };
  }>,
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
