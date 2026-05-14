import { CommandBar, Separator } from 'erxes-ui/components';
import { RecordTable } from 'erxes-ui';
import { DealsActions } from '@/deals/actionBar/components/DealsActions';

export const DealsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedDeals = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedCount = selectedDeals.length;
  const isSelected = selectedCount > 0;

  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedCount} selected</CommandBar.Value>
        <DealsActions deals={selectedDeals} selectedCount={selectedCount} />
        <Separator.Inline />
      </CommandBar.Bar>
    </CommandBar>
  );
};
