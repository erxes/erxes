import { PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PosCoversSheet } from '@/pos/pos-covers/components/CoversSheet';
import { PosCoverFilter } from '~/modules/pos/pos-covers/components/PosCoverFilter';
import { CoversRecordTable } from '@/pos/pos-covers/components/CoversRecordTable';

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
            <PosCoversSheet />
            <PosCoverFilter />
          </PageSubHeader>
          <CoversRecordTable posId={posId} />
        </div>
      </div>
    </>
  );
};
