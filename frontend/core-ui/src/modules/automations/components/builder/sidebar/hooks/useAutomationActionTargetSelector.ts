import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useQueryState } from 'erxes-ui';
import { useActionTarget } from '@/automations/components/builder/nodes/hooks/useActionTarget';
import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { WaitEventTargetTypes } from '../../nodes/actions/waitEvent/type/waitEvent';

export const useAutomationActionTargetSelector = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const [activeNodeId] = useQueryState<string>('activeNodeId');

  const configFieldNamePrefix: `actions.${number}` = `${AutomationNodesType.Actions}.${activeNode.nodeIndex}`;
  const { actionConstMap, actionFolks } = useAutomation();
  const { setValue } = useFormContext<TAutomationBuilderForm>();
  const { actions, triggers } = useAutomationNodes();
  const targetActionId = useMemo(
    () => actions.find((a) => a.id === activeNodeId)?.targetActionId,
    [activeNodeId, actions],
  );
  const { actionsCanBeTarget } = useActionTarget({
    actionId: activeNodeId ?? undefined,
    targetActionId,
  });

  const filteredActionsCanBeTarget = useMemo(() => {
    if (activeNode.type !== 'setProperty') {
      return actionsCanBeTarget;
    }

    return actionsCanBeTarget.filter((action) => action.type !== 'transform');
  }, [actionsCanBeTarget, activeNode.type]);
  const { allowTargetFromActions = false } =
    actionConstMap.get(activeNode.type) || {};

  const trigger = useMemo(
    () =>
      activeNodeId
        ? getTriggerOfAction(activeNodeId, actions, triggers, actionFolks)
        : undefined,
    [activeNodeId, actions, triggers, actionFolks],
  );

  const list = useMemo(() => {
    const actionOptions: Array<{
      type: WaitEventTargetTypes;
      id: string;
      label: string;
      nodeType: string;
      icon?: string;
    }> = [];

    for (const action of filteredActionsCanBeTarget) {
      if (action.id !== activeNodeId) {
        actionOptions.push({
          type: WaitEventTargetTypes.Action,
          id: action.id,
          label: action.label || action.type,
          nodeType: action.type,
          icon: action.icon,
        });
      }
    }
    if (actionOptions.length > 0 && trigger) {
      return [
        {
          type: WaitEventTargetTypes.Trigger,
          id: trigger.id,
          label: `${trigger.label} (Trigger)`,
          nodeType: trigger.type,
          icon: trigger.icon,
        },
        ...actionOptions,
      ];
    }
    return actionOptions;
  }, [filteredActionsCanBeTarget, activeNodeId, trigger]);

  const handleChangeTarget = (
    value: string,
    onChange: (value: string | undefined) => void,
  ) => {
    const isTrigger =
      list.find((item) => item.id === value)?.type ===
      WaitEventTargetTypes.Trigger;

    onChange(isTrigger ? undefined : value);
  };

  useEffect(() => {
    if (trigger?.id && targetActionId === trigger.id) {
      setValue(`${configFieldNamePrefix}.targetActionId`, undefined);
    }
  }, [configFieldNamePrefix, setValue, targetActionId, trigger?.id]);

  return {
    list,
    allowTargetFromActions,
    configFieldNamePrefix,
    handleChangeTarget,
  };
};
