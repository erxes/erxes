import { LoyaltyTimelineView } from '@/loyalty-points/components/LoyaltyTimelineView';
import { useDealScoreLogTimeline } from '../hooks/useDealScoreLogTimeline';
import { TDealScoreLogScope } from '../hooks/useDealScoreLogs';

/** What the matching deals moved per day, week or month. */
export const DealLoyaltyTimeline = ({
  scope,
}: {
  scope: TDealScoreLogScope;
}) => <LoyaltyTimelineView {...useDealScoreLogTimeline(scope)} />;
