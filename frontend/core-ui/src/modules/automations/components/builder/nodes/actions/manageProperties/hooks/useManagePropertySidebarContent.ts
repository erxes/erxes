import { TManagePropertiesForm } from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { useActionTarget } from '@/automations/components/builder/nodes/hooks/useActionTarget';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { getFieldsProperties, TAutomationAction } from 'ui-modules';

export const useManagePropertySidebarContent = (
  currentAction: TAutomationAction,
  form: UseFormReturn<TManagePropertiesForm>,
) => {
  const { triggers, actions } = useAutomationNodes();
  const { control } = form;
  const module = useWatch<TManagePropertiesForm>({
    control,
    name: 'module',
  });

  const { selectedActionType } = useActionTarget({
    targetActionId: currentAction.targetActionId,
  });

  const trigger = getTriggerOfAction(currentAction.id, actions, triggers);

  const propertyType = module || selectedActionType || trigger?.type || '';
  const { propertyTypes } = getFieldsProperties(propertyType);

  return {
    propertyType,
    propertyTypes,
    module,
  };
};
