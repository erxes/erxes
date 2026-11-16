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
  const { executionDetail, actionVersions } = useAutomationExecutionDetail();
  const stepIndex = selectedAction
    ? (executionDetail?.actions || []).indexOf(selectedAction)
    : -1;
  const stepVersion = stepIndex >= 0 ? actionVersions[stepIndex] : null;
  const { actionsConst } = useAutomation();

  const createdAt = selectedAction?.createdAt
    ? new Date(selectedAction.createdAt)
    : null;

  const createdAtLabel =
    createdAt && isValid(createdAt)
      ? format(createdAt, 'yyyy-MM-dd HH:mm:ss')
      : t('history-not-available');
  const versionLabel = stepVersion
    ? t('versions-ran-on', { version: stepVersion })
    : '';

  return {
    action: selectedAction,
    actionStatus: (selectedAction
      ? getExecutionActionStatus(selectedAction)
      : 'success') as TExecutionStatus,
    // When it ran, how long it took, and on which saved version
    metaLabel: [
      createdAtLabel,
      formatExecutionDuration(selectedAction?.durationMs),
      versionLabel,
    ]
      .filter(Boolean)
      .join(' · '),
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
