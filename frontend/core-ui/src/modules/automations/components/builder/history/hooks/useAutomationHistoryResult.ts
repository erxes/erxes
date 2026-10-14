import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { format, isValid } from 'date-fns';
import { IAutomationHistory } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const useAutomationHistoryResult = () => {
  const { t } = useTranslation('automations');
  const { executionDetail, loading, refetch } = useAutomationExecutionDetail();

  const { actionsConst } = useAutomation();
  const { actions = [], status, description } = executionDetail || {};

  const getCreatedAtLabel = (createdAt: Date) => {
    const date = createdAt ? new Date(createdAt) : '';
    return isValid(date)
      ? format(date, 'yyyy-MM-dd HH:mm:ss')
      : t('history-not-available');
  };

  const list = actions.map((action) => ({
    ...action,
    createdAtValue: getCreatedAtLabel(action.createdAt),
    actionTypeLabel:
      actionsConst.find(({ type }) => type === action.actionType)?.label ||
      action.actionType ||
      t('history-empty'),
  }));

  return {
    list,
    status: status as IAutomationHistory['status'],
    executionError: status === 'error' ? description : undefined,
    refetch,
    loading,
  };
};
