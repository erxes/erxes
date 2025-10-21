import { useActionNodeConfiguration } from '@/automations/components/builder/nodes/hooks/useActionNodeConfiguration';
import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useFormContext, useWatch } from 'react-hook-form';

export const ActionNodeConfigurationContent = ({
  data,
}: {
  data: NodeData;
}) => {
  const { control } = useFormContext<TAutomationBuilderForm>();

  const actionData = useWatch({ control, name: `actions.${data.nodeIndex}` });

  if (!actionData) {
    return null;
  }

  const { Component } = useActionNodeConfiguration(data, actionData);

  return Component;
};
