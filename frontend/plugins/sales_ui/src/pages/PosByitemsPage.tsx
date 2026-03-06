import { PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PosByItemsRecordTable } from '@/pos/pos-by-items/components/PosByItemsRecordTable';
import { PosByItemsFilter } from '@/pos/pos-by-items/components/PosByItemsFilter';

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
      <PageSubHeader>
        <PosByItemsFilter />
      </PageSubHeader>
      <PosByItemsRecordTable posId={posId} />
    </>
  );
};
