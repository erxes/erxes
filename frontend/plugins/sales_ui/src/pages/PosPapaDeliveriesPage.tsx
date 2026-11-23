import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PapaDeliveryReport } from '@/pos/papa/components/PapaDeliveryReport';

/** A POS's Papa deliveries report (`/sales/pos/:posId/deliveries`). */
export const PosPapaDeliveriesPage = () => {
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
      <div className="flex h-full w-full overflow-hidden">
        <PapaDeliveryReport posId={posId} />
      </div>
    </>
  );
};
