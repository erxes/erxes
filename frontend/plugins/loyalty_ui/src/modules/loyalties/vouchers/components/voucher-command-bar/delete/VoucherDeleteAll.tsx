import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { DELETE_VOUCHERS_BY_FILTER_MUTATION } from '@/loyalties/vouchers/graphql/mutations/mutations';
import { useVouchersVariables } from '@/loyalties/vouchers/hooks/UseVoucherList';

export const VoucherDeleteAll = ({ totalCount }: { totalCount: number }) => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const variables = useVouchersVariables();

  const [removeByFilter, { loading }] = useMutation(
    DELETE_VOUCHERS_BY_FILTER_MUTATION,
    { refetchQueries: ['VouchersMain'] },
  );

  const handleDeleteAll = () => {
    confirm({
      message: t('delete-all-vouchers-confirm', 'Are you sure you want to delete all {{count}} vouchers?', { count: totalCount }),
    }).then(async () => {
      try {
        const result = await removeByFilter({ variables });
        const deleted = result.data?.vouchersRemoveByFilter ?? 0;
        toast({
          title: t('success', 'Success'),
          variant: 'success',
          description: t('vouchers-deleted', '{{count}} voucher(s) deleted successfully', { count: deleted }),
        });
      } catch (e: any) {
        toast({
          title: t('error', 'Error'),
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
      {t('delete-all-count', 'Delete All ({{count}})', { count: totalCount })}
    </Button>
  );
};
