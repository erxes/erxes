import { useAutomation } from '@/automations/context/AutomationProvider';
import { format, isValid } from 'date-fns';
import { IAutomationHistory } from 'ui-modules';

export const useAutomationHistoryResult = (history: IAutomationHistory) => {
  const { actionsConst } = useAutomation();
  const { actions = [] } = history;

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
    status: history.status,
  };
};
