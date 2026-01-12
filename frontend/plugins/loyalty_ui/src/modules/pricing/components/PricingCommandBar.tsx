import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PricingDelete } from '@/pricing/components/PricingDelete';

export function PricingCommandBar() {
  const { table } = RecordTable.useRecordTable();

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id)
    .join(',');

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedCount} selected</CommandBar.Value>
        <Separator.Inline />
        <PricingDelete pricingIds={selectedIds} />
      </CommandBar.Bar>
    </CommandBar>
  );
}
