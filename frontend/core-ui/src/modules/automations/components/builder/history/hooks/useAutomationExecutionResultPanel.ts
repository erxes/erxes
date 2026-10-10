import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { useAutomationExecutionSelection } from '@/automations/components/builder/history/context/AutomationExecutionSelectionContext';
import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  formatExecutionDuration,
  getExecutionActionStatus,
  TExecutionStatus,
} from '@/automations/utils/automationHistoryUtils/executionFormat';
import { format, isValid } from 'date-fns';
import { IAutomationHistory } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const useAutomationExecutionResultPanel = () => {
  const { t } = useTranslation('automations');
  const { selectedAction, clearSelection } = useAutomationExecutionSelection();
  const { executionDetail } = useAutomationExecutionDetail();
  const { actionsConst } = useAutomation();

  const createdAt = selectedAction?.createdAt
    ? new Date(selectedAction.createdAt)
    : null;

  return {
    action: selectedAction,
    actionStatus: (selectedAction
      ? getExecutionActionStatus(selectedAction)
      : 'success') as TExecutionStatus,
    createdAtLabel:
      createdAt && isValid(createdAt)
        ? format(createdAt, 'yyyy-MM-dd HH:mm:ss')
        : t('history-not-available'),
    durationLabel: formatExecutionDuration(selectedAction?.durationMs),
    executionStatus: executionDetail?.status as IAutomationHistory['status'],
    isWorkflowAction: selectedAction?.actionType === 'workflow',
    label:
      actionsConst.find(({ type }) => type === selectedAction?.actionType)
        ?.label ||
      selectedAction?.actionType ||
      t('action'),
    onClose: clearSelection,
  };
};
