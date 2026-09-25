import { AUTOMATION_EXECUTION_COUNTS } from '@/automations/graphql/automationQueries';
import {
  automationExecutionCountsLoadingState,
  automationExecutionCountsState,
} from '@/automations/states/automationExecutionCountsState';
import { TAutomationStatsCount } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

/**
 * Loads run counts for the listed automations in one request and publishes them
 * to the counts atoms. Kept out of the table's render path on purpose.
 */
export const useAutomationExecutionCounts = (automationIds: string[]) => {
  const setCounts = useSetAtom(automationExecutionCountsState);
  const setLoading = useSetAtom(automationExecutionCountsLoadingState);

  const { data, loading } = useQuery<{
    automationExecutionCounts: TAutomationStatsCount[];
  }>(AUTOMATION_EXECUTION_COUNTS, {
    variables: { automationIds },
    skip: !automationIds.length,
  });

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  useEffect(() => {
    const counts = data?.automationExecutionCounts;

    if (!counts) {
      return;
    }

    // Automations with no runs are absent from the payload; default them to 0
    // so their cell shows a number instead of a stuck skeleton.
    setCounts((current) => ({
      ...current,
      ...Object.fromEntries(automationIds.map((id) => [id, 0])),
      ...Object.fromEntries(counts.map(({ key, count }) => [key, count])),
    }));
  }, [data, automationIds, setCounts]);
};
