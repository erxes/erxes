import {
  TAutomationWaitEventConfig,
  WaitEventTargetTypes,
} from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodesType } from '@/automations/types';
import {
  findTriggerForAction,
  getAllTriggersForAction,
} from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useFormContext } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

export function useWaitEventConfigContent(
  targetType: TAutomationWaitEventConfig['targetType'],
  action: TAutomationAction,
  selectedNodeId?: string,
) {
  const { getValues } = useFormContext<TAutomationBuilderForm>();
  const { actions } = useAutomationNodes();

  if (targetType === WaitEventTargetTypes.Trigger) {
    const triggers = getAllTriggersForAction(
      action.id,
      getValues('actions'),
      getValues('triggers'),
    );

    const selectedTriggerId = getValues(
      `${AutomationNodesType.Actions}.${(getValues('actions') || []).findIndex(
        (a) => a.id === action.id,
      )}.config.targetTriggerId`,
    ) as string | undefined;

    const selected = selectedTriggerId
      ? triggers.find(({ trigger }) => trigger.id === selectedTriggerId)
          ?.trigger
      : findTriggerForAction(
          action.id,
          getValues('actions'),
          getValues('triggers'),
        );

    return { contentType: selected?.type };
  }

  return {
    contentType: actions.find((a) => a.id === selectedNodeId)?.type,
  };
}
