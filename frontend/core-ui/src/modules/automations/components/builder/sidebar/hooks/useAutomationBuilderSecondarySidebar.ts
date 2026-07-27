import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { WORKFLOW_INPUT_NODE_ID } from '@/automations/components/builder/nodes/components/WorkflowInputNode';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useWorkflowEditScope } from '@/automations/context/WorkflowEditScopeProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import { useTranslation } from 'react-i18next';

export const useAutomationBuilderSecondarySidebar = () => {
  const { t } = useTranslation('automations');
  const { queryParams } = useAutomation();
  const { triggers, actions } = useAutomationNodes();
  const workflowEditScope = useWorkflowEditScope();

  const inputNames = Object.keys(workflowEditScope?.inputs || {});

  const sourceNodes: TAutomationVariableSourceNode[] = [
    // Inside the workflow edit sheet the outer scope is invisible; the
    // workflow inputs are offered instead, insertable as {{ input.<name> }}.
    ...(workflowEditScope && inputNames.length
      ? [
          {
            id: WORKFLOW_INPUT_NODE_ID,
            type: '',
            nodeType: AutomationNodeType.Workflow,
            label: 'Inputs',
            icon: 'IconArrowBarToRight',
            kindLabel: 'Input',
            staticVariables: inputNames.map((name) => ({
              key: name,
              label: name,
            })),
          },
        ]
      : []),
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
