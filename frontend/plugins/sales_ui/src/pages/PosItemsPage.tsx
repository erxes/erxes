import { Can, PageHeader, Export } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PosItemsRecordTable } from '@/pos/pos-items/components/PosItemsRecordTable';
import { PosItemsFilter } from '@/pos/pos-items/components/PosItemsFilter';
import { usePosItemsList } from '~/modules/pos/pos-items/hooks/UsePosItemsList';
import { POS_ORDER_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { useOpenPosPanelFromQuery } from '@/pos/hooks/useOpenPosPanelFromQuery';
import { toLegacyPosItemOrderId } from '@/pos/utils/posOrderJson';

export const PosItemsPage = () => {
  const { posId } = useParams();

  useOpenPosPanelFromQuery(
    'pos_order_id',
    POS_ORDER_CONTENT_TYPE,
    toLegacyPosItemOrderId,
  );
  const { variables } = usePosItemsList();
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
            <Can action="posItemsExportManage">
              <Export
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
    </>
  );
};
