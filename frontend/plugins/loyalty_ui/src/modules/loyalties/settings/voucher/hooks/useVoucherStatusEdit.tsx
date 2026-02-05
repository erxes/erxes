import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_VOUCHER_CAMPAIGN } from '../graphql/mutations/voucherEditStatusMutations';
import { QUERY_VOUCHER_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';

export function useVoucherStatusEdit() {
  const { toast } = useToast();

  const [editVoucher, { loading, error }] = useMutation(
    UPDATE_VOUCHER_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_VOUCHER_CAMPAIGNS,
        },
      ],
    },
  );

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editVoucher({
      variables: {
        _id: variables._id,
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Voucher status updated successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { editStatus, loading, error };
}
