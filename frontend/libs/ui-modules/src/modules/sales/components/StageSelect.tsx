import { dealPipelineState, dealStageState } from '../states';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';

import { SelectStage } from './common/select/SelectStages';

export const StageSelect = ({
  stageId,
  className,
  onChange,
}: {
  stageId?: string;
  className?: string;
  onChange?: (stageId: string | string[], callback?: () => void) => void;
}) => {
  const setStageId = useSetAtom(dealStageState);
  const pipeline = useAtomValue(dealPipelineState);
  const currentStage = useAtomValue(dealStageState);

  const pipelineId = pipeline?.pipelineId || '';
  const isInitialized = useRef(false);
  const previousPipelineId = useRef(pipelineId);

  useEffect(() => {
    if (stageId && !isInitialized.current) {
      setStageId({ stageId });
      isInitialized.current = true;
    } else if (!stageId && !isInitialized.current) {
      isInitialized.current = true;
    }
  }, [stageId, setStageId]);

  useEffect(() => {
    if (previousPipelineId.current !== pipelineId && pipelineId) {
      if (!stageId) {
        setStageId(null);
      }
      previousPipelineId.current = pipelineId;
    }
  }, [pipelineId, setStageId, stageId]);

  return (
    <SelectStage.InlineCell
      mode="single"
      value={currentStage?.stageId || ''}
      pipelineId={pipelineId}
      className={className}
      onValueChange={(stageId, isAutoSelection) => {
        setStageId({
          stageId: stageId as string,
        });

        if (!isAutoSelection) {
          onChange?.(stageId);
        }
      }}
    />
  );
};
