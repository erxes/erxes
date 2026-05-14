import { SelectStage } from './common/select/SelectStages';
import { dealPipelineState } from '../states';
import { useAtomValue } from 'jotai';

export const StageSelect = ({
  stageId,
  pipelineId: dealPipelineId,
  className,
  onChange,
}: {
  stageId?: string;
  pipelineId?: string;
  className?: string;
  onChange?: (stageId: string | string[], callback?: () => void) => void;
}) => {
  const pipeline = useAtomValue(dealPipelineState);
  const pipelineId = pipeline?.pipelineId || dealPipelineId || '';

  return (
    <SelectStage.InlineCell
      mode="single"
      value={stageId || ''}
      pipelineId={pipelineId}
      className={className}
      onValueChange={(stageId) => {
        onChange?.(stageId);
      }}
    />
  );
};
