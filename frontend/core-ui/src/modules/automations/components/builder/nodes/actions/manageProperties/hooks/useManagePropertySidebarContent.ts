import { TManagePropertiesForm } from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { useActionTarget } from '@/automations/components/builder/nodes/hooks/useActionTarget';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useGetFieldsProperties, TAutomationAction } from 'ui-modules';

export const useManagePropertySidebarContent = (
  currentAction: TAutomationAction,
  form: UseFormReturn<TManagePropertiesForm>,
) => {
  const { actionFolks } = useAutomation();
  const { triggers, actions } = useAutomationNodes();
  const { control, setValue } = form;
  const module = useWatch<TManagePropertiesForm>({
    control,
    name: 'module',
  });
  const setPropertyTarget = useWatch<TManagePropertiesForm>({
    control,
    name: 'setPropertyTarget',
  });

  const { selectedActionType } = useActionTarget({
    actionId: currentAction.id,
    targetActionId: currentAction?.targetActionId,
  });

  const trigger = getTriggerOfAction(
    currentAction.id,
    actions,
    triggers,
    actionFolks,
  );

  const sourceType = selectedActionType || trigger?.type || '';
  const selectedPropertyType = module || sourceType;
  const { propertyTypes, loading } = useGetFieldsProperties(
    selectedPropertyType,
    {
      source: 'automations',
      sourceType,
    },
  );
  const defaultPropertyType = propertyTypes[0]?.value || sourceType;
  const propertyType = module || defaultPropertyType;
  const selectedPropertyTarget = useMemo(
    () =>
      propertyTypes.find((p) => p.value === propertyType) ||
      propertyTypes.find((p) => propertyType.startsWith(p.value)),
    [propertyTypes, propertyType],
  );
  const isPropertyTypeValid = useMemo(
    () =>
      !!propertyTypes.find(
        (p) => propertyType === p.value || propertyType.startsWith(p.value),
      ),
    [propertyTypes, propertyType],
  );

  useEffect(() => {
    if (!module && defaultPropertyType) {
      setValue('module', defaultPropertyType);
    }
  }, [defaultPropertyType, module, setValue]);

  useEffect(() => {
    if (!selectedPropertyTarget) {
      return;
    }

    if (
      setPropertyTarget?.type === selectedPropertyTarget.type &&
      setPropertyTarget?.source === selectedPropertyTarget.source
    ) {
      return;
    }

    setValue('setPropertyTarget', selectedPropertyTarget);
  }, [selectedPropertyTarget, setPropertyTarget, setValue]);

  return {
    propertyType,
    sourceType,
    propertyTypes,
    loading,
    module,
    isPropertyTypeValid,
  };
};
