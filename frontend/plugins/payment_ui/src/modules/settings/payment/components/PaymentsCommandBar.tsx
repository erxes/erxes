import { usePaymentRemove } from '@/payment/hooks/usePaymentRemove';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const PaymentsCommandBar = () => {
  const { t } = useTranslation('payment');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removePayment } = usePaymentRemove();

  const handleDelete = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original._id);

    confirm({
      message: `Are you sure you want to delete the ${
        selectedIds.length
      } payment${selectedIds.length === 1 ? '' : 's'}?`,
    }).then(() => {
      removePayment({
        variables: { _ids: selectedIds },
        onCompleted: () => {
          table.resetRowSelection();
        },
      });
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', { count: table.getFilteredSelectedRowModel().rows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
        >
          <IconTrash />
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
