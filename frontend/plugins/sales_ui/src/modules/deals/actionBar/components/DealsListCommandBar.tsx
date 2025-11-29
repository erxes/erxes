import { CommandBar, Separator } from 'erxes-ui/components';
import { RecordTable } from 'erxes-ui';
import { DealsListActionBar } from './DealsListAction';
import { IDeal } from '@/deals/types/deals';

export const DealsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedDeals = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedCount = selectedDeals.length;
  const isSelected = selectedCount > 0;
  const activeDeal = selectedDeals[0] || ({} as IDeal);

  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedCount} selected</CommandBar.Value>
        {isSelected && (
          <>
            <DealsListActionBar deal={activeDeal} />
            <Separator.Inline />
          </>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
