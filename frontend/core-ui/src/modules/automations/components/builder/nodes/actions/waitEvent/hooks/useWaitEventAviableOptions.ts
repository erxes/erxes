import { TAutomationTrigger } from 'ui-modules';
import { WAIT_EVENT_TYPES } from '@/automations/components/builder/nodes/actions/waitEvent/constants/waitEventConstants';
import { WaitEventTargetTypes } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { useActionTarget } from '@/automations/components/builder/nodes/hooks/useActionTarget';

export const useWaitEventAviableOptions = (
  trigger: TAutomationTrigger | undefined,
  currentActionId: string,
) => {
  const { actionsCanBeTarget } = useActionTarget({
    actionId: currentActionId,
  });
  let waitEventOptions = WAIT_EVENT_TYPES;

  if (trigger && !trigger?.isCustom) {
    waitEventOptions = [
      {
        id: trigger.id,
        type: WaitEventTargetTypes.Trigger,
        label: `${trigger.label} (Trigger)`,
        icon: trigger.icon,
      },
      ...waitEventOptions,
    ];
  }

  if (actionsCanBeTarget?.length) {
    waitEventOptions = [
      ...waitEventOptions,
      ...actionsCanBeTarget.map((action) => ({
        id: action.id,
        type: WaitEventTargetTypes.Action,
        label: `${action.label} (Action)`,
        icon: action.icon,
      })),
    ];
  }
  return {
    waitEventOptions,
    actionsCanBeTarget,
  };
};
