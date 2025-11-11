import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PosOrdersBySubsRecordTable } from '@/pos/pos-order-by-subsription/components/PosOrdersBySubsRecordTable';

export const PosOrderBySubsPage = () => {
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

      <PosOrdersBySubsRecordTable posId={posId} />
    </>
  );
};
