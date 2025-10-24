import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadCrumb } from '~/modules/pos/pos/breadcumb/PosBreadCumb';
import { CoversRecordTable } from '~/modules/pos/pos-covers/components/CoversRecordTable';

export const CoversPage = () => {
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

      <CoversRecordTable />
    </>
  );
};
