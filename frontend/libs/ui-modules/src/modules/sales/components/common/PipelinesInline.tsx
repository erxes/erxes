import {
  PipelinesInlineContext,
  usePipelinesInlineContext,
} from '../../contexts';
import {
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
  isUndefinedOrNull,
} from 'erxes-ui';
import { useEffect, useState } from 'react';

import { IPipeline } from '../../types';
import { usePipelineDetail } from '../../hooks';

export interface PipelinesInlineProps {
  pipelineIds?: string[];
  pipelines?: IPipeline[];
  placeholder?: string;
  updatePipelines?: (pipelines: IPipeline[]) => void;
}

const PipelinesInlineRoot = (props: PipelinesInlineProps) => {
  return (
    <PipelinesInlineProvider {...props}>
      <PipelinesInlineTitle />
    </PipelinesInlineProvider>
  );
};

const PipelinesInlineProvider = ({
  children,
  pipelineIds,
  pipelines,
  placeholder,
  updatePipelines,
}: PipelinesInlineProps & {
  children?: React.ReactNode;
}) => {
  const [_pipelines, _setPipelines] = useState<IPipeline[]>(pipelines || []);

  useEffect(() => {
    if (pipelines) {
      // Sync provided pipelines to local state
      _setPipelines(pipelines);
      return;
    }

    if (!pipelineIds?.length) {
      _setPipelines([]);
      return;
    }

    _setPipelines((prev) =>
      prev.filter((pipeline) => pipelineIds.includes(pipeline._id)),
    );
  }, [pipelineIds, pipelines]);

  return (
    <PipelinesInlineContext.Provider
      value={{
        pipelines: pipelines || _pipelines,
        loading: false,
        pipelineIds: pipelineIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select pipelines'
          : placeholder,
        updatePipelines: updatePipelines || _setPipelines,
      }}
    >
      {children}
      {pipelineIds?.map((pipelineId) => (
        <PipelinesInlineEffectComponent
          key={pipelineId}
          pipelineId={pipelineId}
        />
      ))}
    </PipelinesInlineContext.Provider>
  );
};

const PipelinesInlineEffectComponent = ({
  pipelineId,
}: {
  pipelineId: string;
}) => {
  const { pipelines, updatePipelines } = usePipelinesInlineContext();
  const { pipelineDetail } = usePipelineDetail({
    variables: {
      _id: pipelineId,
    },
  });

  useEffect(() => {
    const newPipelines = [...pipelines].filter((p) => p._id !== pipelineId);

    if (pipelineDetail) {
      updatePipelines?.([...newPipelines, pipelineDetail]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineDetail]);

  return null;
};

const PipelinesInlineTitle = () => {
  const { pipelines, loading, placeholder } = usePipelinesInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (pipelines.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (pipelines.length < 3) {
    return (
      <TextOverflowTooltip value={pipelines.map((p) => p.name).join(', ')} />
    );
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${pipelines.length} pipelines`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {pipelines.map((pipeline) => pipeline.name).join(', ')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const PipelinesInline = Object.assign(PipelinesInlineRoot, {
  Provider: PipelinesInlineProvider,
  Title: PipelinesInlineTitle,
});
