import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { VOUCHERS_ADD_MANY_MUTATION } from '../graphql/mutations/mutations';

export const useAddVoucher = () => {
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
            title: 'Error',
            description:
              'Failed to create vouchers. Please check the campaign configuration.',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Success',
          description: 'Voucher created successfully',
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

  return { voucherAdd, loading, error };
};
