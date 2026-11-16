import { AUTOMATION_RECENT_RUNS } from '@/automations/graphql/automationQueries';
import { automationRecentRunsState } from '@/automations/states/automationRecentRunsState';
import { TAutomationRecentRuns } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';

/**
 * Latest runs of the listed automations in one request, published to atoms.
 * Render reads the cache only: a render the router discards (navigation runs
 * in a transition) must not start a request, or each response restarts it.
 * Fresh runs load once the list is on screen, so returning from a builder
 * never shows old runs.
 */
export const useAutomationRecentRuns = (automationIds: string[]) => {
  const setRuns = useSetAtom(automationRecentRunsState);

  const { data, loading, refetch } = useQuery<{
    automationRecentRuns: TAutomationRecentRuns[];
  }>(AUTOMATION_RECENT_RUNS, {
    variables: { automationIds },
    skip: !automationIds.length,
    fetchPolicy: 'cache-first',
  });

  // Read in the effect without re-running it when the first request settles
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  useEffect(() => {
    // A cache miss is already on the network; refresh only what came from cache
    if (automationIds.length && !loadingRef.current) {
      refetch();
    }
  }, [automationIds, refetch]);

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
