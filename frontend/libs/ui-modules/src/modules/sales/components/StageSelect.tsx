import { SelectStage } from './common/select/SelectStages';
import { dealPipelineState } from '../states';
import { useAtomValue } from 'jotai';

export const StageSelect = ({
  stageId,
  className,
}: {
  stageId?: string;
  className?: string;
}) => {
  // const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);

  const pipelineId = pipeline?.pipelineId || '';
  console.log('pipelineId:', pipelineId);
  return (
    <SelectStage.InlineCell
      mode="single"
      value={stageId}
      pipelineId={pipelineId}
      className={className}
      onValueChange={(stageId) => {
        // editDeals({
        //   variables: {
        //     _id: deal._id,
        //     boardId: board.boardId || deal.boardId,
        //     pipelineId: pipeline.pipelineId || deal.pipeline?._id,
        //     stageId: stageId as string,
        //   },
        // });
      }}
    />
  );
};
