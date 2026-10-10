import { useMemo } from 'react';
import { useMultiQueryState } from 'erxes-ui';
import { parseDateRangeFromString } from 'erxes-ui/modules/filter/date-filter/utils/parseDateRangeFromString';

/**
 * Reads the score filters from the URL query state and builds the GraphQL
 * variables shared by both the scores table (`useScoreList`) and the score
 * statistics (`useScoreStatistics`), so the summary always reflects the same
 * rows shown in the table.
 */
export const useScoreFilters = () => {
  const [
    {
      scoreOwnerType,
      scoreOwnerId,
      scoreCampaignId,
      scoreDate,
      scoreAction,
      description,
    },
  ] = useMultiQueryState<{
    scoreOwnerType: string;
    scoreOwnerId: string;
    scoreCampaignId: string;
    scoreDate: string;
    scoreAction: string;
    description: string;
  }>([
    'scoreOwnerType',
    'scoreOwnerId',
    'scoreCampaignId',
    'scoreDate',
    'scoreAction',
    'description',
  ]);

  const dateRange = parseDateRangeFromString(scoreDate);

  return useMemo(
    () => ({
      ownerType: scoreOwnerType || undefined,
      ownerId: scoreOwnerId || undefined,
      campaignId: scoreCampaignId || undefined,
      fromDate: dateRange?.from?.toISOString() || undefined,
      toDate: dateRange?.to?.toISOString() || undefined,
      action: scoreAction || undefined,
      description: description || undefined,
    }),
    [
      scoreOwnerType,
      scoreOwnerId,
      scoreCampaignId,
      dateRange?.from,
      dateRange?.to,
      scoreAction,
      description,
    ],
  );
};
