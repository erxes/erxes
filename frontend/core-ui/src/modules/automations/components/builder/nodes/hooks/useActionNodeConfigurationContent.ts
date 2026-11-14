import { useActionNodeConfiguration } from '@/automations/components/builder/nodes/hooks/useActionNodeConfiguration';
import { useNodeContent } from '@/automations/components/builder/nodes/hooks/useTriggerNodeContent';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { FieldPath, useFormContext, useWatch } from 'react-hook-form';

/**
 * The action's own content component, fed the action as the form holds it,
 * or as it was when a read-only run recorded it.
 */
export const useActionNodeConfigurationContent = (data: NodeData) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const watchedActionData = useWatch({
    control,
    name: data.formPath as FieldPath<TAutomationBuilderForm>,
  });
  const actionData = data.readOnly ? data.actionSnapshot : watchedActionData;
  const { Component } = useActionNodeConfiguration(data, actionData);
  const { hasError, shouldRender } = useNodeContent(
    data,
    AutomationNodeType.Action,
  );

  return {
    Component,
    isVisible: shouldRender && !hasError && !!Component && !!actionData,
  };
};
