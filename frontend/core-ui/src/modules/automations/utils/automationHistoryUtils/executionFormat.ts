import { IAutomationHistoryAction } from 'ui-modules';

export type TExecutionStatus = 'success' | 'error' | 'waiting';

export const formatExecutionDuration = (durationMs?: number) => {
  if (typeof durationMs !== 'number' || durationMs < 0) {
    return 'N/A';
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(durationMs < 10_000 ? 2 : 1)} s`;
  }

  const minutes = Math.floor(durationMs / 60_000);
  const seconds = ((durationMs % 60_000) / 1000).toFixed(1);

  return `${minutes}m ${seconds}s`;
};

// The engine only started writing `status` later, so a recorded error still
// decides the outcome for older executions
export const getExecutionActionStatus = (
  action: IAutomationHistoryAction,
): TExecutionStatus => {
  if (action.result?.error) {
    return 'error';
  }

  return action.status ?? 'success';
};
