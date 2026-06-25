import { Can, PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { OrderRecordTable } from '../modules/pos/orders/components/OrderRecordTable';
import { PosBreadcrumb } from '../modules/pos/pos/breadcumb/PosBreadcrumb';
import { PosOrderFilter } from '../modules/pos/orders/components/PosOrderFilter';
import { PosOrderSideWidget } from '../modules/pos/orders/detail/PosOrderSideWidget';
import { PosOrderSheet } from '~/modules/pos/orders/components/PosOrderSheet';
import { useOrdersVariables } from '@/pos/orders/hooks/UseOrderList';
import {
  SalesExport,
  SalesImport,
} from '~/modules/import-export/components/SalesImportExportActions';

export const OrdersPage = () => {
  const { posId } = useParams();
  const { t } = useTranslation();
  const variables = useOrdersVariables({ posId });

  const getFilters = () => {
    const { ...filters } = variables || {};
    return filters;
  };

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              {posId && (
                <>
                  <PosBreadcrumb />
                  <Separator.Inline />
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <div className="flex overflow-hidden w-full h-full">
        <div className="flex flex-col overflow-hidden w-full h-full">
          <PageSubHeader>
            <PosOrderSheet />
            <PosOrderFilter />
            <Can action="posOrderChangePayments">
              <SalesImport
                pluginName="sales"
                moduleName="pos"
                collectionName="posItems"
                title={t('sales.importExport.importPosItems', {
                  defaultValue: 'Import POS Items',
                })}
              />
            </Can>
            <Can action="posItemsExportManage">
              <SalesExport
                pluginName="sales"
                moduleName="pos"
                collectionName="posItems"
                getFilters={getFilters}
              />
            </Can>
          </PageSubHeader>
          <OrderRecordTable posId={posId} />
        </div>
        <PosOrderSideWidget />
      </div>
    </>
  );
};
