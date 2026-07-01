import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import { useTranslation } from 'react-i18next';

export const useAutomationBuilderSecondarySidebar = () => {
  const { t } = useTranslation('automations');
  const { queryParams } = useAutomation();
  const { triggers, actions } = useAutomationNodes();
  const sourceNodes: TAutomationVariableSourceNode[] = [
    ...triggers.map((trigger) => ({
      id: trigger.id,
      type: trigger.type,
      nodeType: AutomationNodeType.Trigger,
      label: trigger.label,
      icon: trigger.icon,
    })),
    ...actions.map((action) => ({
      id: action.id,
      type: action.type,
      nodeType: AutomationNodeType.Action,
      label: action.label,
      icon: action.icon,
    })),
  ].filter((node) => node.id !== queryParams.activeNodeId);

  const emptyState = getEmptyState({
    hasSourceNodes: !!sourceNodes.length,
    t,
  });

  return {
    sourceNodes,
    emptyState,
  };
};

const getEmptyState = ({
  hasSourceNodes,
  t,
}: {
  hasSourceNodes: boolean;
  t: (key: string, defaultValue: string) => string;
}) => {
  if (!hasSourceNodes) {
    return {
      title: t('no-output-variables-yet', 'No output variables yet'),
      description: t(
        'no-output-variables-description',
        'Add a trigger or action to the workflow to browse its output variables here.',
      ),
    };
  }

  return null;
};
