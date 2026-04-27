import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { DELETE_VOUCHER_MUTATION } from '@/loyalties/vouchers/graphql/mutations/mutations';
import { IVoucher } from '@/loyalties/vouchers/types/voucher';

export const VoucherRemove = ({
  voucherIds,
  rows,
}: {
  voucherIds: string[];
  rows: Row<IVoucher>[];
}) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const [deleteVoucher] = useMutation(DELETE_VOUCHER_MUTATION, {
    refetchQueries: ['VouchersMain'],
  });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete ${voucherIds.length} selected voucher(s)?`,
        }).then(async () => {
          try {
            await deleteVoucher({ variables: { _ids: voucherIds } });
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: 'Success',
              variant: 'success',
              description: `${voucherIds.length} voucher(s) deleted successfully`,
            });
          } catch (e: unknown) {
            toast({
              title: 'Error',
              description: e instanceof Error ? e.message : String(e),
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
