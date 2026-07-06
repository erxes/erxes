import { Can, PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PosItemsRecordTable } from '@/pos/pos-items/components/PosItemsRecordTable';
import { PosItemsFilter } from '@/pos/pos-items/components/PosItemsFilter';
import { PosItemDetailSheet } from '@/pos/pos-items/detail/PosItemDetailSheet';
import { usePosItemsVariables } from '~/modules/pos/pos-items/hooks/UsePosItemsList';
import {
  SalesExport,
  SalesImport,
} from '~/modules/import-export/components/SalesImportExportActions';

export const PosItemsPage = () => {
  const { posId } = useParams();
  const { t } = useTranslation();
  const variables = usePosItemsVariables({ posId });
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
            <PosItemsFilter />
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
          <PosItemsRecordTable posId={posId} />
        </div>
      </div>
      <PosItemDetailSheet />
    </>
  );
};
