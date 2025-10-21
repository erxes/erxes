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
import { getAllTriggersForAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

export function useWaitEventConfigForm(
  currentAction: TAutomationAction,
  currentActionIndex: number,
) {
  const { actionsConst } = useAutomation();
  const { actions } = useAutomationNodes();

  const { getValues, watch } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const configFieldNamePrefix: TAutomationActionConfigFieldPrefix = `${AutomationNodesType.Actions}.${currentActionIndex}.config`;

  const config = watch(configFieldNamePrefix) as TAutomationWaitEventConfig;

  const triggers = getAllTriggersForAction(
    currentAction.id,
    getValues('actions'),
    getValues('triggers'),
  );

  const nonCustomTriggers = triggers.filter(({ trigger }) => !trigger.isCustom);

  // Auto-select single non-custom trigger if present and none selected yet
  useEffect(() => {
    const selectedId = config?.targetTriggerId;
    if (!selectedId && nonCustomTriggers.length === 1) {
      setAutomationBuilderFormValue(
        `${configFieldNamePrefix}.targetTriggerId`,
        nonCustomTriggers[0].trigger.id,
        {
          shouldDirty: true,
          shouldTouch: true,
        },
      );
    }
  }, [
    config?.targetTriggerId,
    nonCustomTriggers.length,
    setAutomationBuilderFormValue,
    configFieldNamePrefix,
  ]);

  let waitEventOptions = WAIT_EVENT_TYPES;

  if (!nonCustomTriggers?.length) {
    waitEventOptions = waitEventOptions.filter(
      ({ type }) => type !== WaitEventTargetTypes.Trigger,
    );
  }

  const actionTypesCanBeTarget = actionsConst
    .filter(({ canBeTarget }) => canBeTarget)
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
