import { CommandBar, Separator } from 'erxes-ui/components';
import { RecordTable } from 'erxes-ui';
import { DealsActions } from '@/deals/actionBar/components/DealsActions';
import { useTranslation } from 'react-i18next';
import { Export } from 'ui-modules';

export const DealsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedDeals = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedCount = selectedDeals.length;
  const isSelected = selectedCount > 0;
  const { t } = useTranslation('sales');

  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedCount} {t('selected')}</CommandBar.Value>
        <DealsActions deals={selectedDeals} selectedCount={selectedCount} />
        <Separator.Inline />
        <Export
          pluginName="sales"
          moduleName="deal"
          collectionName="deals"
          buttonVariant="secondary"
          ids={selectedDeals.map((deal) => deal._id)}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
