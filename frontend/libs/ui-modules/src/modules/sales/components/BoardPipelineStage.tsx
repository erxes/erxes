import { RecordTableInlineCell, useQueryState } from 'erxes-ui';
import {
  dealBoardState,
  dealPipelineState,
} from '../states/dealContainerStates';
import { useAtomValue, useSetAtom } from 'jotai';

import { IDeal } from '../types/deals';
import { SelectBoard } from '../select/SelectBoard';
import { SelectPipeline } from '../select/SelectPipeline';
import { SelectStage } from '../select/SelectStage';
import { dealDetailSheetState } from '../states/dealDetailSheetState';
import { useDealsEdit } from '../hooks/useDeals';

export const BoardCell = ({
  deal,
  className,
}: {
  deal: IDeal;
  className?: string;
}) => {
  const setBoardId = useSetAtom(dealBoardState);

  return (
    <SelectBoard
      value={deal.boardId}
      className={className}
      onValueChange={(boardId) => {
        setBoardId({
          boardId: boardId as string,
        });
      }}
    />
  );
};

export const PipelineCell = ({
  deal,
  className,
}: {
  deal: IDeal;
  className?: string;
}) => {
  const setPipelineId = useSetAtom(dealPipelineState);
  const board = useAtomValue(dealBoardState);

  const boardId = board.boardId || deal.boardId;

  return (
    <SelectPipeline.InlineCell
      value={deal.pipeline?._id}
      boardId={boardId}
      className={className}
      onValueChange={(pipelineId) => {
        setPipelineId({
          pipelineId: pipelineId as string,
        });
      }}
    />
  );
};

export const StageCell = ({
  deal,
  className,
}: {
  deal: IDeal;
  className?: string;
}) => {
  const { editDeals } = useDealsEdit();

  const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);

  const pipelineId = pipeline.pipelineId || deal.pipeline?._id;

  return (
    <SelectStage.InlineCell
      mode="single"
      value={deal.stage?._id}
      pipelineId={pipelineId}
      className={className}
      onValueChange={(stageId) => {
        editDeals({
          variables: {
            _id: deal._id,
            boardId: board.boardId || deal.boardId,
            pipelineId: pipeline.pipelineId || deal.pipeline?._id,
            stageId: stageId as string,
          },
        });
      }}
    />
  );
};
