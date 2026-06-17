import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { IPutResponse, IPosOrderDetail } from '../types/msDynamicCheckOrder';
import { DetailRow, DetailSection } from './PosOrderDetailLayout';

/** Ebarimt response rows gargana. */
const EbarimtResponses = ({ responses }: { responses: IPutResponse[] }) => {
  if (!responses.length) return null;

  return (
    <DetailSection title="Ebarimt Responses">
      <div className="rounded-md border border-border/70 px-4">
        {responses.map((response: IPutResponse) => (
          <div
            key={response.billId}
            className="border-b border-border/60 py-3 last:border-b-0"
          >
            <DetailRow label="Bill ID" value={response.billId} />
            <DetailRow
              label="Ebarimt Date"
              value={response.date ? dayjs(response.date).format('LLL') : '-'}
            />
          </div>
        ))}
      </div>
    </DetailSection>
  );
};

/** Extra order info ba ebarimt rows gargana. */
export const PosOrderExtraInfo = ({
  orders,
  responses,
}: {
  orders: IPosOrderDetail;
  responses: IPutResponse[];
}) => {
  const hasExtraInfo =
    orders.deliveryInfo || orders.syncErkhetInfo || orders.convertDealId;

  if (!hasExtraInfo && !responses.length) return null;

  return (
    <div className="space-y-6">
      {hasExtraInfo && (
        <DetailSection title="Extra Info">
          <div className="rounded-md border border-border/70 px-4">
            {orders.deliveryInfo && (
              <DetailRow
                label="Delivery Info"
                value={orders.deliveryInfo.description}
              />
            )}
            {orders.syncErkhetInfo && (
              <DetailRow label="Erkhet Info" value={orders.syncErkhetInfo} />
            )}
            {orders.convertDealId && (
              <DetailRow
                label="Deal"
                value={
                  orders.dealLink ? (
                    <Link
                      to={orders.dealLink}
                      className="text-primary underline underline-offset-4"
                    >
                      {orders.deal?.name || 'Deal'}
                    </Link>
                  ) : (
                    orders.deal?.name || 'Deal'
                  )
                }
              />
            )}
          </div>
        </DetailSection>
      )}
      <EbarimtResponses responses={responses} />
    </div>
  );
};
