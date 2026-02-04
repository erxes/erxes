import { dealBoardState, dealPipelineState } from '../states';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';

import { SelectPipeline } from './common/select/SelectPipelines';

export const PipelineSelect = ({
  pipelineId,
  className,
  onChange,
}: {
  pipelineId?: string;
  className?: string;
  onChange?: (pipelineId: string | string[], callback?: () => void) => void;
}) => {
  const setPipelineId = useSetAtom(dealPipelineState);
  const board = useAtomValue(dealBoardState);
  const currentPipeline = useAtomValue(dealPipelineState);

  const boardId = board?.boardId || '';
  const isInitialized = useRef(false);
  const previousBoardId = useRef(boardId);

  useEffect(() => {
    if (pipelineId && !isInitialized.current) {
      setPipelineId({ pipelineId });
      isInitialized.current = true;
    }
  }, [pipelineId, setPipelineId]);

  useEffect(() => {
    if (previousBoardId.current !== boardId && boardId) {
      setPipelineId(null);
      previousBoardId.current = boardId;
    }
  }, [boardId, setPipelineId]);

  return (
    <SelectPipeline.InlineCell
      value={currentPipeline?.pipelineId || ''}
      boardId={boardId}
      className={className}
      onValueChange={(pipelineId) => {
        setPipelineId({
          pipelineId: pipelineId as string,
        });
        onChange?.(pipelineId);
      }}
    />
  );
};
