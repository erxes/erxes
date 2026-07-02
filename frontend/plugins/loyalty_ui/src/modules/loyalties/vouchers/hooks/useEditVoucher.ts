import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { VOUCHERS_EDIT_MUTATION } from '../graphql/mutations/mutations';

export const useEditVoucher = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [editVoucher, { loading, error }] = useMutation(
    VOUCHERS_EDIT_MUTATION,
    {
      refetchQueries: ['VouchersMain'],
    },
  );

  const voucherEdit = async (variables: {
    _id: string;
    campaignId?: string;
    ownerId?: string;
    ownerType?: string;
    status?: string;
  }) => {
    return editVoucher({
      variables,
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('voucher-updated'),
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

  return { voucherEdit, loading, error };
};
