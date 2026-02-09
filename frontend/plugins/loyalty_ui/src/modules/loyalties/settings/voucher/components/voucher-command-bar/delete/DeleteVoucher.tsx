import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useDeleteVoucher } from '../../../hooks/useDeleteVoucher';

export const DeleteVoucher = ({ voucherIds }: { voucherIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeVoucher } = useDeleteVoucher();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${voucherIds.length} selected voucher(s)?`,
        }).then(() => {
          removeVoucher({
            variables: { _ids: voucherIds },
          })
            .then(() => {
              toast({
                title: `${voucherIds.length} voucher(s) deleted successfully`,
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
