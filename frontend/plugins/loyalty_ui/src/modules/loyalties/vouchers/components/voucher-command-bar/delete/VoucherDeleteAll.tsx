import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { DELETE_VOUCHERS_BY_FILTER_MUTATION } from '@/loyalties/vouchers/graphql/mutations/mutations';
import { useVouchersVariables } from '@/loyalties/vouchers/hooks/UseVoucherList';

export const VoucherDeleteAll = ({ totalCount }: { totalCount: number }) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const variables = useVouchersVariables();

  const [removeByFilter, { loading }] = useMutation(
    DELETE_VOUCHERS_BY_FILTER_MUTATION,
    { refetchQueries: ['VouchersMain'] },
  );

  const handleDeleteAll = () => {
    confirm({
      message: `Are you sure you want to delete all ${totalCount} vouchers?`,
    }).then(async () => {
      try {
        const result = await removeByFilter({ variables });
        const deleted = result.data?.vouchersRemoveByFilter ?? 0;
        toast({
          title: 'Success',
          variant: 'success',
          description: `${deleted} voucher(s) deleted successfully`,
        });
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={handleDeleteAll}
      disabled={loading}
    >
      <IconTrash />
      Delete All ({totalCount})
    </Button>
  );
};
