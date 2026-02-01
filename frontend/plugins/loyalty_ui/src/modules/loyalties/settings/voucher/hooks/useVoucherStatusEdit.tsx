import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { editVoucherStatusMutation } from '../graphql/mutations/voucherEditStatusMutations';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';

export function useVoucherStatusEdit() {
  const { toast } = useToast();

  const [editVoucher, { loading, error }] = useMutation(
    editVoucherStatusMutation,
    {
      refetchQueries: [
        {
          query: getCampaignsQuery,
        },
      ],
    },
  );

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editVoucher({
      variables: {
        id: variables._id,
        kind: 'voucher',
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
