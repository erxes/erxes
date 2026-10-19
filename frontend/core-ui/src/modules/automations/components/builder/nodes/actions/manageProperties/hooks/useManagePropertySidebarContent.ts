import { TManagePropertiesForm } from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { useActionTarget } from '@/automations/components/builder/nodes/hooks/useActionTarget';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useAutomationSetPropertyTargets, TAutomationAction } from 'ui-modules';

const LEGACY_AUTOMATION_SOURCE_TYPES: Record<string, string> = {
  'tickets:ticket': 'frontline:tickets.tickets',
};

const normalizeAutomationSourceType = (sourceType?: string) =>
  sourceType ? LEGACY_AUTOMATION_SOURCE_TYPES[sourceType] || sourceType : '';

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

  const sourceType = normalizeAutomationSourceType(
    selectedActionType || trigger?.type,
  );
  const { propertyTypes, loading } =
    useAutomationSetPropertyTargets(sourceType);
  const defaultPropertyType = propertyTypes[0]?.value || sourceType;
  const normalizedModule = normalizeAutomationSourceType(module);
  const propertyType = normalizedModule || defaultPropertyType;
  const selectedPropertyTarget = useMemo(
    () =>
      propertyTypes.find((p) => p.value === propertyType) ||
      propertyTypes.find((p) => propertyType.startsWith(p.value)),
    [propertyTypes, propertyType],
  );
  const isPropertyTypeValid = useMemo(
    () =>
      !!propertyTypes.find(
        (p) =>
          propertyType === p.value ||
          propertyType.startsWith(p.value) ||
          p.sourceType === propertyType,
      ),
    [propertyTypes, propertyType],
  );

  useEffect(() => {
    if (module && normalizedModule !== module) {
      setValue('module', normalizedModule);
      return;
    }

    // Before the targets load, the default falls back to the source type,
    // which no property type option carries as its value.
    if (loading || !propertyTypes.length) {
      return;
    }

    if (!module) {
      setValue('module', defaultPropertyType);
      return;
    }

    // The module and its rules were picked for the previous target; a new
    // target brings its own property types and fields.
    if (!isPropertyTypeValid) {
      setValue('module', defaultPropertyType);
      setValue('rules', [{ field: '', operator: '' }]);
    }
  }, [
    defaultPropertyType,
    isPropertyTypeValid,
    loading,
    module,
    normalizedModule,
    propertyTypes.length,
    setValue,
  ]);

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
