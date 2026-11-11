import { useAutomation } from '@/automations/context/AutomationProvider';
import { AUTOMATION_RECENT_RUNS } from '@/automations/graphql/automationQueries';
import { TAutomationRecentRuns } from '@/automations/types';
import { getAutomationRunHealth } from '@/automations/utils/automationRunHealth';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

/**
 * Recent run health of the open automation. The canvas banner fetches it on
 * every builder visit, so returning from history shows current runs; nodes
 * only read what it fetched, so a canvas of nodes is still one request.
 */
export const useAutomationRunHealth = ({
  cacheOnly = false,
}: { cacheOnly?: boolean } = {}) => {
  const { detail } = useAutomation();
  const automationId = detail?._id;

  const { data } = useQuery<{
    automationRecentRuns: TAutomationRecentRuns[];
  }>(AUTOMATION_RECENT_RUNS, {
    variables: { automationIds: [automationId] },
    skip: !automationId,
    fetchPolicy: cacheOnly ? 'cache-only' : 'cache-and-network',
    nextFetchPolicy: cacheOnly ? 'cache-only' : 'cache-first',
  });

  const runs = data?.automationRecentRuns?.[0]?.runs;

  return useMemo(() => getAutomationRunHealth(runs), [runs]);
};
