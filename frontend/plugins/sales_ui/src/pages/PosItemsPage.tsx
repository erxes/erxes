import { PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PosItemsRecordTable } from '@/pos/pos-items/components/PosItemsRecordTable';
import { PosItemsFilter } from '@/pos/pos-items/components/PosItemsFilter';
import { PosItemDetailSheet } from '@/pos/pos-items/detail/PosItemDetailSheet';
import { Export } from 'ui-modules';
import { usePosItemsList } from '~/modules/pos/pos-items/hooks/UsePosItemsList';

export const PosItemsPage = () => {
  const { posId } = useParams();
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
            <Export
              pluginName="sales"
              moduleName="posItem"
              collectionName="posItem"
              getFilters={getFilters}
            />
          </PageSubHeader>
          <PosItemsRecordTable posId={posId} />
        </div>
      </div>
      <PosItemDetailSheet />
    </>
  );
};
