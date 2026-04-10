import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useMultiQueryState } from 'erxes-ui';
import { parseDateRangeFromString } from 'erxes-ui/modules/filter/date-filter/utils/parseDateRangeFromString';
import { useSetAtom } from 'jotai';
import { SCORE_LOG_LIST_QUERY } from '../graphql/queries';
import { IScoreLog } from '../types/score';
import { scoreTotalCountAtom } from '../states/scoreCounts';

export const useScoreList = () => {
  const setTotalCount = useSetAtom(scoreTotalCountAtom);

  const [
    {
      scoreOwnerType,
      scoreOwnerId,
      scoreCampaignId,
      scoreDate,
      scoreOrderType,
      scoreAction,
      scoreStageId,
      number,
      description,
    },
  ] = useMultiQueryState<{
    scoreOwnerType: string;
    scoreOwnerId: string;
    scoreCampaignId: string;
    scoreDate: string;
    scoreOrderType: string;
    scoreAction: string;
    scoreStageId: string;
    number: string;
    description: string;
  }>([
    'scoreOwnerType',
    'scoreOwnerId',
    'scoreCampaignId',
    'scoreDate',
    'scoreOrderType',
    'scoreAction',
    'scoreStageId',
    'number',
    'description',
  ]);

  const dateRange = parseDateRangeFromString(scoreDate);

  const { data, loading, refetch } = useQuery(SCORE_LOG_LIST_QUERY, {
    variables: {
      ownerType: scoreOwnerType || undefined,
      ownerId: scoreOwnerId || undefined,
      campaignId: scoreCampaignId || undefined,
      fromDate: dateRange?.from?.toISOString() || undefined,
      toDate: dateRange?.to?.toISOString() || undefined,
      orderType: scoreOrderType || undefined,
      action: scoreAction || undefined,
      stageId: scoreStageId || undefined,
      number: number || undefined,
      description: description || undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

  const list: IScoreLog[] = data?.scoreLogList?.list || [];
  const total: number = data?.scoreLogList?.total || 0;

  useEffect(() => {
    setTotalCount(total);
  }, [total, setTotalCount]);

  return { list, total, loading, refetch };
};
