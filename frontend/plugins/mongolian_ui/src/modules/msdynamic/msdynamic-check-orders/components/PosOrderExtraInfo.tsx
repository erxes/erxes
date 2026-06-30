import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IPutResponse, IPosOrderDetail } from '../types/msDynamicCheckOrder';
import { DetailRow, DetailSection } from './PosOrderDetailLayout';

/** Ebarimt response rows gargana. */
const EbarimtResponses = ({ responses }: { responses: IPutResponse[] }) => {
  const { t } = useTranslation('mongolian');
  if (!responses.length) return null;

  return (
    <DetailSection title={t('ebarimt-responses')}>
      <div className="rounded-md border border-border/70 px-4">
        {responses.map((response: IPutResponse) => (
          <div
            key={response.billId}
            className="border-b border-border/60 py-3 last:border-b-0"
          >
            <DetailRow label={t('bill-id')} value={response.billId} />
            <DetailRow
              label={t('ebarimt-date')}
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
  const { t } = useTranslation('mongolian');
  const hasExtraInfo =
    orders.deliveryInfo || orders.syncErkhetInfo || orders.convertDealId;

  if (!hasExtraInfo && !responses.length) return null;

  return (
    <div className="space-y-6">
      {hasExtraInfo && (
        <DetailSection title={t('extra-info')}>
          <div className="rounded-md border border-border/70 px-4">
            {orders.deliveryInfo && (
              <DetailRow
                label={t('delivery-info')}
                value={orders.deliveryInfo.description}
              />
            )}
            {orders.syncErkhetInfo && (
              <DetailRow label={t('erkhet-info')} value={orders.syncErkhetInfo} />
            )}
            {orders.convertDealId && (
              <DetailRow
                label={t('deal')}
                value={
                  orders.dealLink ? (
                    <Link
                      to={orders.dealLink}
                      className="text-primary underline underline-offset-4"
                    >
                      {orders.deal?.name || t('deal')}
                    </Link>
                  ) : (
                    orders.deal?.name || t('deal')
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
