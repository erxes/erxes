import { SelectPipeline } from './common/select/SelectPipelines';
import { dealBoardState } from '../states';
import { useAtomValue } from 'jotai';

export const PipelineSelect = ({
  pipelineId,
  className,
  onChange,
}: {
  pipelineId?: string;
  className?: string;
  onChange?: (pipelineId: string | string[], callback?: () => void) => void;
}) => {
  const board = useAtomValue(dealBoardState);
  const boardId = board?.boardId || '';

  return (
    <SelectPipeline.InlineCell
      mode="single"
      value={pipelineId || ''}
      boardId={boardId}
      className={className}
      onValueChange={(pipelineId) => {
        onChange?.(pipelineId);
      }}
    />
  );
};
