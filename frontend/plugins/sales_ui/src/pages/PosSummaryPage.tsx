import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '~/modules/pos/pos/breadcumb/PosBreadcrumb';
import { PosSummaryRecordTable } from '~/modules/pos/pos-summary/components/PosSummaryRecordTable';

export const PosSummaryPage = () => {
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
      <PosSummaryRecordTable posId={posId} />
    </>
  );
};
