import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useDeleteVoucher } from '../../../hooks/useDeleteVoucher';

export const DeleteVoucher = ({ voucherIds }: { voucherIds: string[] }) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { removeVoucher } = useDeleteVoucher();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-voucher-confirm', 'Are you sure you want to delete {{count}} selected voucher(s)?', { count: voucherIds.length }),
        }).then(() => {
          removeVoucher({
            variables: { _ids: voucherIds },
          })
            .then(() => {
              toast({
                title: t('vouchers-deleted', '{{count}} voucher(s) deleted successfully', { count: voucherIds.length }),
                variant: 'success',
              });
            })
            .catch((e: ApolloError) => {
              toast({
                title: t('error', 'Error'),
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      {t('delete', 'Delete')}
    </Button>
  );
};
