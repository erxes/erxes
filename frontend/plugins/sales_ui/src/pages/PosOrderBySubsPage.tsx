import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadCrumb } from '~/modules/pos/pos/breadcumb/PosBreadCumb';
import { PosOrdersBySubsRecordTable } from '~/modules/pos/pos-order-by-subsription/components/PosOrdersBySubsRecordTable';

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
                  <PosBreadCrumb />
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
