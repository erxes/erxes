import { IPosItem } from '@/pos/pos-items/types/posItem';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { SalesExport } from '~/modules/import-export/components/SalesImportExportActions';

const getPosItemExportId = (posItem: IPosItem) =>
  posItem.items?._id || posItem._id;

export const PosItemsCommandBar = () => {
  const { t } = useTranslation('sales');
  const { table } = RecordTable.useRecordTable();
  const selectedPosItems = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as IPosItem);
  const exportIds = selectedPosItems.map(getPosItemExportId).filter(Boolean);

  return (
    <CommandBar open={selectedPosItems.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {selectedPosItems.length} {t('selected')}
        </CommandBar.Value>
        <Can action="posItemsExportManage">
          <Separator.Inline />
          <SalesExport
            pluginName="sales"
            moduleName="pos"
            collectionName="posItems"
            buttonVariant="secondary"
            ids={exportIds}
          />
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
