import { useActionNodeConfiguration } from '@/automations/components/builder/nodes/hooks/useActionNodeConfiguration';
import { useNodeContent } from '@/automations/components/builder/nodes/hooks/useTriggerNodeContent';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { FieldPath, useFormContext, useWatch } from 'react-hook-form';

/** The step's configured action, and whether its summary has anything to show. */
export const useBroadcastActionConfigSummary = (data: NodeData) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const actionData = useWatch({
    control,
    name: data.formPath as FieldPath<TAutomationBuilderForm>,
  });
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
