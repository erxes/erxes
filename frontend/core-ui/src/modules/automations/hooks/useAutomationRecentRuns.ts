import { AUTOMATION_RECENT_RUNS } from '@/automations/graphql/automationQueries';
import { automationRecentRunsState } from '@/automations/states/automationRecentRunsState';
import { TAutomationRecentRuns } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

/**
 * Latest runs of the listed automations in one request, published to atoms.
 * Network on every visit: coming back from a builder must not show old runs.
 */
export const useAutomationRecentRuns = (automationIds: string[]) => {
  const setRuns = useSetAtom(automationRecentRunsState);

  const { data } = useQuery<{
    automationRecentRuns: TAutomationRecentRuns[];
  }>(AUTOMATION_RECENT_RUNS, {
    variables: { automationIds },
    skip: !automationIds.length,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const list = data?.automationRecentRuns;

    if (!list) {
      return;
    }

    setRuns((current) => ({
      ...current,
      ...Object.fromEntries(
        list.map(({ automationId, runs }) => [automationId, runs || []]),
      ),
    }));
  }, [data, setRuns]);
};
