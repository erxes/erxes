import { useActionNodeConfiguration } from '@/automations/components/builder/nodes/hooks/useActionNodeConfiguration';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { IconAdjustmentsAlt } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useNodeContent } from '@/automations/components/builder/nodes/hooks/useTriggerNodeContent';

export const ActionNodeConfigurationContent = ({
  data,
}: {
  data: NodeData;
}) => {
  const { control } = useFormContext<TAutomationBuilderForm>();

  const actionData = useWatch({ control, name: `actions.${data.nodeIndex}` });

  const { Component } = useActionNodeConfiguration(data, actionData);

  const { hasError, shouldRender } = useNodeContent(
    data,
    AutomationNodeType.Action,
  );

  if (!shouldRender || hasError || !Component || !actionData) {
    return null;
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 text-success/90 pb-2">
        <IconAdjustmentsAlt className="size-4" />
        <p className="text-sm font-semibold">Configuration</p>
      </div>
      <div className="rounded border bg-muted text-muted-foreground overflow-x-auto">
        {Component}
      </div>
    </div>
  );
};
