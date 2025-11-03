import { WAIT_EVENT_TYPES } from '@/automations/components/builder/nodes/actions/waitEvent/constants/waitEventConstants';
import {
  TAutomationWaitEventConfig,
  WaitEventTargetTypes,
} from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType } from '@/automations/types';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

export function useWaitEventConfigForm(
  currentAction: TAutomationAction,
  currentActionIndex: number,
) {
  const { actionsConst } = useAutomation();
  const { actions, triggers } = useAutomationNodes();

  const { watch } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const configFieldNamePrefix: TAutomationActionConfigFieldPrefix = `${AutomationNodesType.Actions}.${currentActionIndex}.config`;

  const config = watch(configFieldNamePrefix) as TAutomationWaitEventConfig;

  const trigger = getTriggerOfAction(currentAction.id, actions, triggers);

  // Auto-select single non-custom trigger if present and none selected yet
  useEffect(() => {
    const selectedId = config?.targetTriggerId;
    if (!selectedId && trigger && !trigger?.isCustom) {
      setAutomationBuilderFormValue(
        `${configFieldNamePrefix}.targetTriggerId`,
        trigger.id,
        {
          shouldDirty: true,
          shouldTouch: true,
        },
      );
    }
  }, [
    config?.targetTriggerId,
    trigger,
    setAutomationBuilderFormValue,
    configFieldNamePrefix,
  ]);

  let waitEventOptions = WAIT_EVENT_TYPES;

  if (!trigger?.isCustom) {
    waitEventOptions = waitEventOptions.filter(
      ({ type }) => type !== WaitEventTargetTypes.Trigger,
    );
  }

  const actionTypesCanBeTarget = actionsConst
    .filter(({ isTargetSource }) => isTargetSource)
    .map(({ type }) => type);

  const actionsCanBeTarget = actions.filter(({ type }) =>
    actionTypesCanBeTarget.includes(type),
  );

  if (!actionsCanBeTarget?.length) {
    waitEventOptions = waitEventOptions.filter(
      ({ type }) => type !== WaitEventTargetTypes.Action,
    );
  }

  return {
    waitEventOptions,
    configFieldNamePrefix,
    config,
  };
}
