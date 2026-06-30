import { DealWidgetCard } from './DealWidgetCard';
import { Spinner } from 'erxes-ui';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useTranslation } from 'react-i18next';

export const DealWidget = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const { loading, deal } = useDealDetail({ variables: { _id: dealId } });

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (!deal) return <div>{t('no-deal-found')}</div>;

  return <DealWidgetCard deal={deal} />;
};
