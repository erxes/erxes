import { IOrder } from '@/pos/types/order';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { SalesExport } from '~/modules/import-export/components/SalesImportExportActions';

const getOrderExportIds = (order: IOrder) => {
  const itemIds = Array.isArray(order.items)
    ? order.items.map((item) => item?._id).filter(Boolean)
    : [];

  return itemIds.length > 0 ? itemIds : [order._id];
};

export const OrderCommandBar = () => {
  const { t } = useTranslation('sales');
  const { table } = RecordTable.useRecordTable();
  const selectedOrders = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as IOrder);
  const exportIds = selectedOrders.flatMap(getOrderExportIds);

  return (
    <CommandBar open={selectedOrders.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {selectedOrders.length} {t('selected')}
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
