import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosFilter } from '~/modules/pos/pos/PosFilter';
import { PosBreadCrumb } from '~/modules/pos/pos/breadcumb/PosBreadCumb';
import { PosItemsRecordTable } from '~/modules/pos/pos-items/components/PosItemsRecordTable';

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
                  <PosBreadCrumb />
                  <Separator.Inline />
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      {/* <PageHeader>
        <PosFilter />
      </PageHeader> */}
      <PosItemsRecordTable posId={posId} />
    </>
  );
};
