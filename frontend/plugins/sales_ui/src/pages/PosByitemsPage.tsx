import { PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader } from 'erxes-ui';
import { PosByItemsRecordTable } from '@/pos/pos-by-items/components/PosByItemsRecordTable';
import { PosByItemsFilter } from '@/pos/pos-by-items/components/PosByItemsFilter';

export const PosByItemsPage = () => {
  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1"></Breadcrumb.List>
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
