import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { ConstantsQueryResponse } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const RUN_STATUS_LABEL_KEYS: Record<string, string> = {
  complete: 'history-status-succeeded',
  error: 'history-status-failed',
  waiting: 'history-status-waiting',
  standby: 'history-status-standby',
  active: 'history-status-running',
  missed: 'history-status-missed',
};

/** Readable names for a run's status and the action it failed at. */
export const useAutomationRunLabels = () => {
  const { t } = useTranslation('automations');
  const { data } = useQuery<ConstantsQueryResponse>(AUTOMATION_CONSTANTS, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
  });
  const actionsConst = data?.automationConstants?.actionsConst;

  const statusLabel = useCallback(
    (status?: string) =>
      t(RUN_STATUS_LABEL_KEYS[status || ''] || 'history-status-running'),
    [t],
  );

  const actionLabel = useCallback(
    (type?: string) =>
      (type && actionsConst?.find((action) => action.type === type)?.label) ||
      type,
    [actionsConst],
  );

  return { statusLabel, actionLabel };
};
