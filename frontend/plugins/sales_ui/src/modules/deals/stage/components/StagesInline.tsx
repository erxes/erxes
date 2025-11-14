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
import { useEffect, useState } from 'react';
import { useStageDetail } from '../hooks/useStages';

export interface StagesInlineProps {
  stageIds?: string[];
  stages?: IStage[];
  placeholder?: string;
  updateStages?: (stages: IStage[]) => void;
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
}: StagesInlineProps & {
  children?: React.ReactNode;
}) => {
  const [_stages, _setStages] = useState<IStage[]>(stages || []);

  useEffect(() => {
    if (stages) {
      // Sync provided pipelines to local state
      _setStages(stages);
      return;
    }

    if (!stageIds?.length) {
      _setStages([]);
      return;
    }

    _setStages((prev) => prev.filter((stage) => stageIds.includes(stage._id)));
  }, [stageIds, stages]);

  return (
    <StagesInlineContext.Provider
      value={{
        stages: stages || _stages,
        loading: false,
        stageIds: stageIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select stages'
          : placeholder,
        updateStages: updateStages || _setStages,
      }}
    >
      {children}
      {stageIds?.map((stageId) => (
        <StagesInlineEffectComponent key={stageId} stageId={stageId} />
      ))}
    </StagesInlineContext.Provider>
  );
};

const StagesInlineEffectComponent = ({ stageId }: { stageId: string }) => {
  const { stages, updateStages } = useStagesInlineContext();
  const { stageDetail } = useStageDetail({
    variables: {
      _id: stageId,
    },
  });

  useEffect(() => {
    const newStages = [...stages].filter((s) => s._id !== stageId);

    if (stageDetail) {
      updateStages?.([...newStages, stageDetail]);
    }
  }, [stageDetail]);

  return null;
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
