import { TAutomationEdgeType } from '@/automations/constants/edgeTypes';
import { TAutomationFlowDirection } from '@/automations/constants/flowDirection';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useFormContext, useWatch } from 'react-hook-form';

export const useAutomationCanvasLayout = () => {
  const { getValues, setValue } = useFormContext<TAutomationBuilderForm>();
  const [edgeType, flowDirection] = useWatch<TAutomationBuilderForm>({
    name: ['edgeType', 'flowDirection'],
  }) as [TAutomationEdgeType, TAutomationFlowDirection];

  const onEdgeTypeChange = (value: string) => {
    setValue('edgeType', value as TAutomationEdgeType, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onFlowDirectionChange = (value: string) => {
    if (value === flowDirection) {
      return;
    }

    const resetNodePositions = <T extends { position?: unknown }>(
      nodes: T[] = [],
    ) => nodes.map((node) => ({ ...node, position: undefined }));

    setValue('flowDirection', value as TAutomationFlowDirection, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('triggers', resetNodePositions(getValues('triggers')), {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('actions', resetNodePositions(getValues('actions')), {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('workflows', resetNodePositions(getValues('workflows') || []), {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return { edgeType, flowDirection, onEdgeTypeChange, onFlowDirectionChange };
};
