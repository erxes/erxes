import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PricingDelete } from '@/pricing/components/PricingDelete';

export function PricingCommandBar() {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id)
    .join(',');

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('selected-count', { count: selectedCount })}</CommandBar.Value>
        <Separator.Inline />
        <PricingDelete pricingIds={selectedIds} />
      </CommandBar.Bar>
    </CommandBar>
  );
}
