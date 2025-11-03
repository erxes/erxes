import {
  StagesInlineContext,
  useStagesInlineContext,
} from '@/deals/context/StagesInlineContext';
import { IStage } from '@/deals/types/stages';
import {
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
  isUndefinedOrNull,
} from 'erxes-ui';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useStages } from '../hooks/useStages';

export interface StagesInlineProps {
  stageIds?: string[];
  stages?: IStage[];
  placeholder?: string;
  updateStages?: (stages: IStage[]) => void;
  pipelineId?: string;
}

const StagesInlineRoot = (props: StagesInlineProps) => {
  return (
    <StagesInlineProvider {...props}>
      <StagesInlineTitle />
    </StagesInlineProvider>
  );
};

const StagesInlineProvider = ({
  children,
  stageIds,
  stages,
  placeholder,
  updateStages,
  pipelineId,
}: StagesInlineProps & {
  children?: React.ReactNode;
}) => {
  const [_stages, _setStages] = useState<IStage[]>(stages || []);

  const { stages: fetchedStages, loading } = useStages({
    variables: {
      pipelineId: pipelineId || undefined,
    },
    skip: !pipelineId || !!stages,
  });

  // Memoize the computed stages to prevent unnecessary recalculations
  const computedStages = useMemo(() => {
    if (stages) {
      if (stageIds?.length) {
        return stages.filter((stage) => stageIds.includes(stage._id));
      }
      return stages;
    }

    if (!stageIds?.length) {
      return [];
    }

    if (fetchedStages.length > 0) {
      return fetchedStages.filter((stage) => stageIds.includes(stage._id));
    }

    return [];
  }, [stages, fetchedStages, stageIds]);

  // Track previous computed stages IDs to prevent unnecessary updates
  const prevStagesIdsRef = useRef<string>('');

  useEffect(() => {
    const currentStagesIds = computedStages
      .map((s) => s._id)
      .sort()
      .join(',');

    // Only update if the stage IDs have actually changed
    if (prevStagesIdsRef.current !== currentStagesIds) {
      prevStagesIdsRef.current = currentStagesIds;
      _setStages(computedStages);
      // Sync fetched stages back to the provider if updateStages callback is provided
      if (updateStages && computedStages.length > 0) {
        updateStages(computedStages);
      }
    }
  }, [computedStages, updateStages]);

  return (
    <StagesInlineContext.Provider
      value={{
        stages: stages || _stages,
        loading,
        stageIds: stageIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select stages'
          : placeholder,
        updateStages: updateStages || _setStages,
      }}
    >
      {children}
    </StagesInlineContext.Provider>
  );
};

const StagesInlineTitle = () => {
  const { stages, loading, placeholder } = useStagesInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (stages.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (stages.length < 3) {
    return <TextOverflowTooltip value={stages.map((s) => s.name).join(', ')} />;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${stages.length} stages`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {stages.map((stage) => stage.name).join(', ')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const StagesInline = Object.assign(StagesInlineRoot, {
  Provider: StagesInlineProvider,
  Title: StagesInlineTitle,
});
