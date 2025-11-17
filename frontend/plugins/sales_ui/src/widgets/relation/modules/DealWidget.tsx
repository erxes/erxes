import { DealsBoardCard } from '@/deals/boards/components/DealsBoardCard';
// import { DealWidgetCard } from './DealWidgetCard';
import { Spinner } from 'erxes-ui';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';

export const DealWidget = ({ dealId }: { dealId: string }) => {
  const { loading, deal } = useDealDetail({ variables: { _id: dealId } });
  console.log('ddd', deal);
  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (deal) {
    return <DealsBoardCard id={deal._id} column={deal.stage?._id || ''} />;
  }

  return <div>No deal found</div>;
};
