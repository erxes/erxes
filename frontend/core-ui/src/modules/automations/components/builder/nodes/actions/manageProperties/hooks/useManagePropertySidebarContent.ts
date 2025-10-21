import { TManagePropertiesForm } from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getAllTriggersForAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { getFieldsProperties, TAutomationAction } from 'ui-modules';

export const useManagePropertySidebarContent = (
  currentAction: TAutomationAction,
  form: UseFormReturn<TManagePropertiesForm>,
) => {
  const { triggers, actions } = useAutomationNodes();
  const { control, setValue } = form;
  const { actionsConst } = useAutomation();
  const module = useWatch<TManagePropertiesForm>({
    control,
    name: 'module',
  });

  const reachableTriggers = getAllTriggersForAction(
    currentAction.id,
    actions,
    triggers,
  );

  let additionalAttributes: any[] = [];
  const nonCustomTriggers = reachableTriggers.filter(
    ({ trigger }) => !trigger.isCustom,
  );

  const actionTypesCanBeTarget = actionsConst
    .filter(({ canBeTarget }) => canBeTarget)
    .map(({ type }) => type);
  const actionsCanBeTarget = actions.filter(({ type }) =>
    actionTypesCanBeTarget.includes(type),
  );

  const targetTriggerId = useWatch({ control, name: 'targetTriggerId' });
  const targetActionId = useWatch({ control, name: 'targetActionId' });

  // Auto-select when only one option exists
  useEffect(() => {
    if (!targetTriggerId && nonCustomTriggers.length === 1) {
      setValue('targetTriggerId', nonCustomTriggers[0].trigger.id, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [targetTriggerId, nonCustomTriggers, setValue]);

  useEffect(() => {
    if (!targetActionId && actionsCanBeTarget.length === 1) {
      setValue('targetActionId', actionsCanBeTarget[0].id, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [targetActionId, actionsCanBeTarget, setValue]);

  const selectedTriggerType =
    (targetTriggerId &&
      nonCustomTriggers.find(({ trigger }) => trigger.id === targetTriggerId)
        ?.trigger.type) ||
    (nonCustomTriggers.length === 1 ? nonCustomTriggers[0].trigger.type : '');

  const selectedActionType =
    (targetActionId &&
      actionsCanBeTarget.find((a) => a.id === targetActionId)?.type) ||
    (actionsCanBeTarget.length === 1 ? actionsCanBeTarget[0].type : '');

  // Priority: module → trigger (single or selected) → action (single or selected)
  const propertyType =
    module || selectedTriggerType || selectedActionType || '';
  const { propertyTypes } = getFieldsProperties(propertyType);

  return {
    propertyType,
    propertyTypes,
    module,
    nonCustomTriggers,
    actionsCanBeTarget,
    additionalAttributes,
  };
};
