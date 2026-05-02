import { CommandBar, Separator } from 'erxes-ui/components';
import { RecordTable } from 'erxes-ui';
import { DealsActions } from '@/deals/actionBar/components/DealsActions';
import { Export } from 'ui-modules/modules/import-export/components/epxort/Export';

export const DealsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedDeals = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedCount = selectedDeals.length;
  const isSelected = selectedCount > 0;
  const dealIds = selectedDeals.map((d) => d._id);

  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedCount} selected</CommandBar.Value>
        <DealsActions deals={selectedDeals} selectedCount={selectedCount} />
        <Separator.Inline />
        <Export
          pluginName="sales"
          moduleName="deal"
          collectionName="deal"
          buttonVariant="secondary"
          ids={dealIds}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
