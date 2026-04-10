import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { VOUCHERS_EDIT_MUTATION } from '../graphql/mutations/mutations';

export const useEditVoucher = () => {
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
          title: 'Success',
          description: 'Voucher updated successfully',
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { voucherEdit, loading, error };
};
