import { DealWidgetCard } from './DealWidgetCard';
import { Spinner } from 'erxes-ui';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';

export const DealWidget = ({ dealId }: { dealId: string }) => {
  const { loading, deal } = useDealDetail({ variables: { _id: dealId } });

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (!deal) return <div>No deal found</div>;

  return <DealWidgetCard deal={deal} />;
};
