import { useAutomationExecutionDetail } from '@/automations/components/builder/history/hooks/useAutomationExecutionDetail';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { format, isValid } from 'date-fns';
import { IAutomationHistory } from 'ui-modules';

export const useAutomationHistoryResult = () => {
  const { executionDetail, loading, refetch } = useAutomationExecutionDetail();

  const { actionsConst } = useAutomation();
  const { actions = [], status } = executionDetail || {};

  const getCreatedAtLabel = (createdAt: Date) => {
    const date = createdAt ? new Date(createdAt) : '';
    return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm:ss') : 'N/A';
  };

  const list = actions.map((action) => ({
    ...action,
    createdAtValue: getCreatedAtLabel(action.createdAt),
    actionTypeLabel:
      actionsConst.find(({ type }) => type === action.actionType)?.label ||
      action.actionType ||
      'Empty',
  }));

  return {
    list,
    status: status as IAutomationHistory['status'],
    refetch,
    loading,
  };
};
