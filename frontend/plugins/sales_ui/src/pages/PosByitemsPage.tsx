import { PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { PosByItemsRecordTable } from '@/pos/pos-by-items/components/PosByItemsRecordTable';
import { PosByItemsFilter } from '@/pos/pos-by-items/components/PosByItemsFilter';
import { PosBreadcrumb } from '~/modules/pos/pos/breadcumb/PosBreadcrumb';
import { useParams } from 'react-router-dom';

export const PosByItemsPage = () => {
  const { posId } = useParams();
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
            <PosByItemsFilter />
          </PageSubHeader>
          <PosByItemsRecordTable />
        </div>
      </div>
    </>
  );
};
