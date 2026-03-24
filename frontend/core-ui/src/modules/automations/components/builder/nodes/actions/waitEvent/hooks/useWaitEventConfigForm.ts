import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { AutomationNodesType } from '@/automations/types';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';
import { useWaitEventAviableOptions } from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventAviableOptions';

export function useWaitEventConfigForm(
  currentAction: TAutomationAction,
  currentActionIndex: number,
) {
  const { actionFolks } = useAutomation();
  const { actions, triggers } = useAutomationNodes();

  const { control } = useFormContext<TAutomationBuilderForm>();
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const trigger = getTriggerOfAction(
    currentAction.id,
    actions,
    triggers,
    actionFolks,
  );

  const { waitEventOptions } = useWaitEventAviableOptions(
    trigger,
    currentAction.id,
  );
  const configFieldNamePrefix: TAutomationActionConfigFieldPrefix = `${AutomationNodesType.Actions}.${currentActionIndex}.config`;

  const config = useWatch({
    control,
    name: configFieldNamePrefix,
  }) as TAutomationWaitEventConfig;

  const onSelectTargetTypeId = (value: string) => {
    const selectedOption = waitEventOptions.find((opt) => opt.id === value);
    if (selectedOption) {
      setAutomationBuilderFormValue(`${configFieldNamePrefix}.segmentId`, '');
      setAutomationBuilderFormValue(
        `${configFieldNamePrefix}.targetTypeId`,
        value,
      );
      setAutomationBuilderFormValue(
        `${configFieldNamePrefix}.targetType`,
        selectedOption.type,
      );
    }
  };

  // Auto-select single non-custom trigger if present and none selected yet
  useEffect(() => {
    const selectedId = config?.targetTypeId;
    if (!selectedId && trigger && !trigger?.isCustom) {
      setAutomationBuilderFormValue(
        `${configFieldNamePrefix}.targetTypeId`,
        trigger.id,
        {
          shouldDirty: true,
          shouldTouch: true,
        },
      );
    }
  }, [
    config?.targetTypeId,
    trigger,
    setAutomationBuilderFormValue,
    configFieldNamePrefix,
  ]);

  return {
    waitEventOptions,
    configFieldNamePrefix,
    config,
    onSelectTargetTypeId,
  };
}
