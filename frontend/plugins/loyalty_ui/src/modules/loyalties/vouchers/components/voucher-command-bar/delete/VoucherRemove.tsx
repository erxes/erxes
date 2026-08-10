import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { DELETE_VOUCHER_MUTATION } from '@/loyalties/vouchers/graphql/mutations/mutations';
import { IVoucher } from '@/loyalties/vouchers/types/voucher';

export const VoucherRemove = ({
  voucherIds,
  rows,
}: {
  voucherIds: string[];
  rows: Row<IVoucher>[];
}) => {
  const { t } = useTranslation('loyalty');
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
          message: t('delete-voucher-confirm', { count: voucherIds.length }),
        }).then(async () => {
          try {
            await deleteVoucher({ variables: { _ids: voucherIds } });
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: t('success'),
              variant: 'success',
              description: t('vouchers-deleted', { count: voucherIds.length }),
            });
          } catch (e: unknown) {
            toast({
              title: t('error'),
              description: e instanceof Error ? e.message : String(e),
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
