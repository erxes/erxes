import { PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PosItemsRecordTable } from '@/pos/pos-items/components/PosItemsRecordTable';
import { PosItemsFilter } from '@/pos/pos-items/components/PosItemsFilter';

export const PosItemsPage = () => {
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
      <PageSubHeader>
        <PosItemsFilter />
      </PageSubHeader>
      <PosItemsRecordTable posId={posId} />
    </>
  );
};
