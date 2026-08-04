import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IVoucher } from '@/loyalties/vouchers/types/voucher';
import { VoucherRemove } from './delete/VoucherRemove';

export const VoucherCommandBar = () => {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel()
    .rows as Row<IVoucher>[];
  const voucherIds = selectedRows.map((row) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('selected-count', { count: selectedRows.length })}</CommandBar.Value>
        <Separator.Inline />
        <VoucherRemove voucherIds={voucherIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
