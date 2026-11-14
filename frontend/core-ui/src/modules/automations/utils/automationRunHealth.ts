import { TAutomationRecentRun } from '@/automations/types';

// Runs that ended; a run still going says nothing about health yet
const FINISHED_STATUSES = ['complete', 'error'];
const HEALTH_WINDOW = 5;

export type TAutomationRunHealthLevel = 'failing' | 'degraded';

export type TAutomationRunHealth = {
  level: TAutomationRunHealthLevel | null;
  failed: number;
  checked: number;
  passRate: number | null;
  lastFailure?: TAutomationRecentRun;
  failedActionCounts: Record<string, number>;
};

/**
 * Health is read off the latest finished runs: every one failed is failing,
 * any one failed is degraded.
 */
export const getAutomationRunHealth = (
  runs: TAutomationRecentRun[] = [],
): TAutomationRunHealth => {
  const finished = runs.filter(({ status }) =>
    FINISHED_STATUSES.includes(status || ''),
  );
  const recent = finished.slice(0, HEALTH_WINDOW);
  const failures = recent.filter(({ status }) => status === 'error');
  const passed = finished.filter(({ status }) => status === 'complete').length;

  const failedActionCounts: Record<string, number> = {};

  for (const { failedActionId } of failures) {
    if (failedActionId) {
      failedActionCounts[failedActionId] =
        (failedActionCounts[failedActionId] || 0) + 1;
    }
  }

  const level: TAutomationRunHealthLevel | null = !failures.length
    ? null
    : failures.length === recent.length
    ? 'failing'
    : 'degraded';

  return {
    level,
    failed: failures.length,
    checked: recent.length,
    passRate: finished.length
      ? Math.round((passed / finished.length) * 100)
      : null,
    lastFailure: failures[0],
    failedActionCounts,
  };
};
