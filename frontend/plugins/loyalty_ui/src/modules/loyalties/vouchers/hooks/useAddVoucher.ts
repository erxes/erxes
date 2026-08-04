import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { VOUCHERS_ADD_MANY_MUTATION } from '../graphql/mutations/mutations';

export const useAddVoucher = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [addVouchers, { loading, error }] = useMutation(
    VOUCHERS_ADD_MANY_MUTATION,
    {
      refetchQueries: ['VouchersMain'],
    },
  );

  const voucherAdd = async (variables: {
    campaignId?: string;
    ownerIds?: string[];
    ownerType?: string;
    tagIds?: string[];
    status?: string;
  }) => {
    return addVouchers({
      variables,
      onCompleted: (data) => {
        if (data?.vouchersAddMany === 'error') {
          toast({
            title: t('error'),
            description: t('voucher-create-failed'),
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: t('success'),
          description: t('voucher-created'),
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { voucherAdd, loading, error };
};
