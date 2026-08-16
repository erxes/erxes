import { useAutomation } from '@/automations/context/AutomationProvider';
import { useMultiQueryState } from 'erxes-ui';

export const AUTOMATION_ERROR_CODES = [
  'CONFIG_INVALID',
  'NOT_FOUND',
  'PLUGIN_NOT_ENABLED',
  'PLUGIN_ACTION_FAILED',
  'AI_AGENT_FAILED',
  'WORKFLOW_DEPTH_EXCEEDED',
  'WEBHOOK_TIMEOUT',
  'WEBHOOK_NETWORK_FAILED',
  'WEBHOOK_BAD_RESPONSE',
  'WEBHOOK_FAILED',
  'PROVIDER_ERROR',
  'INTERNAL_ERROR',
  'BUSINESS_ERROR',
  'UNKNOWN',
] as const;

export type TAutomationHistoryFilterQueries = {
  failedActionId?: string;
  errorCode?: string;
  waitingActionId?: string;
};

export const useAutomationHistoryFilterOptions = () => {
  const { detail, actionsConst } = useAutomation();
  const [queries, setQueries] =
    useMultiQueryState<TAutomationHistoryFilterQueries>([
      'failedActionId',
      'errorCode',
      'waitingActionId',
    ]);

  const actionOptions = (detail?.actions || []).map((action) => ({
    id: action.id,
    label:
      actionsConst.find(({ type }) => type === action.type)?.label ||
      action.type,
    description: action.description,
  }));

  const getActionLabel = (actionId?: string | null) =>
    actionOptions.find(({ id }) => id === actionId)?.label || actionId;

  return { queries, setQueries, actionOptions, getActionLabel };
};
