import { useActionNodeConfiguration } from '@/automations/components/builder/nodes/hooks/useActionNodeConfiguration';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { IconAdjustmentsAlt } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useNodeContent } from '@/automations/components/builder/nodes/hooks/useTriggerNodeContent';
import { memo } from 'react';

type ActionNodeConfigurationContentProps = {
  data: NodeData;
};

const isEqualConfig = (first: unknown, second: unknown): boolean => {
  if (Object.is(first, second)) {
    return true;
  }

  if (
    typeof first !== 'object' ||
    typeof second !== 'object' ||
    first === null ||
    second === null
  ) {
    return false;
  }

  if (Array.isArray(first) || Array.isArray(second)) {
    if (!Array.isArray(first) || !Array.isArray(second)) {
      return false;
    }

    return (
      first.length === second.length &&
      first.every((item, index) => isEqualConfig(item, second[index]))
    );
  }

  const firstRecord = first as Record<string, unknown>;
  const secondRecord = second as Record<string, unknown>;
  const firstKeys = Object.keys(firstRecord);
  const secondKeys = Object.keys(secondRecord);

  return (
    firstKeys.length === secondKeys.length &&
    firstKeys.every((key) => isEqualConfig(firstRecord[key], secondRecord[key]))
  );
};

const ActionNodeConfigurationContentComponent = ({
  data,
}: ActionNodeConfigurationContentProps) => {
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

export const ActionNodeConfigurationContent = memo(
  ActionNodeConfigurationContentComponent,
  (previousProps, nextProps) => {
    const previousData = previousProps.data;
    const nextData = nextProps.data;

    return (
      previousData.id === nextData.id &&
      previousData.nodeIndex === nextData.nodeIndex &&
      previousData.type === nextData.type &&
      previousData.error === nextData.error &&
      previousData.isCustom === nextData.isCustom &&
      isEqualConfig(previousData.config, nextData.config)
    );
  },
);
