import {
  dealBoardState,
  dealPipelineState,
  dealStageState,
} from '../states/dealContainerStates';
import { useAtomValue, useSetAtom } from 'jotai';

import { IDeal } from '../types/deals';
import { SelectBoard } from '../select/SelectBoard';
import { SelectPipeline } from '../select/SelectPipeline';
import { SelectStage } from '../select/SelectStage';

import { useDealDetail, useDealsEdit } from '../hooks/useDeals';
import { Button } from 'erxes-ui';

export const BoardCell = ({ className }: { className?: string }) => {
  const { deal } = useDealDetail();
  const setBoardId = useSetAtom(dealBoardState);

  if (!deal) return null;

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

export const PipelineCell = ({ className }: { className?: string }) => {
  const { deal } = useDealDetail();
  const setPipelineId = useSetAtom(dealPipelineState);
  const board = useAtomValue(dealBoardState);

  if (!deal) return null;

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

export const StageCell = ({ className }: { className?: string }) => {
  const { deal } = useDealDetail();
  const setStageId = useSetAtom(dealStageState);

  const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);

  if (!deal) return null;

  const pipelineId = pipeline.pipelineId || deal.pipeline?._id;

  return (
    <SelectStage.InlineCell
      mode="single"
      value={deal.stage?._id}
      pipelineId={pipelineId}
      className={className}
      onValueChange={(stageId) => {
        setStageId({
          stageId: stageId as string,
        });
      }}
    />
  );
};

export const SaveSelectsButton = ({
  mutation,
  className,
  children,
  itemId,
  idParamName = '_id',
}: {
  mutation: (variables: any) => void;
  className?: string;
  children?: React.ReactNode;
  itemId?: string;
  idParamName?: string;
}) => {
  const { deal } = useDealDetail();
  const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);
  const stage = useAtomValue(dealStageState);

  const onClick = () => {
    const id = itemId || deal?._id;

    if (!id) return;

    mutation({
      variables: {
        [idParamName]: id,
        boardId: board.boardId || deal?.boardId,
        pipelineId: pipeline.pipelineId || deal?.pipeline?._id,
        stageId: stage.stageId || deal?.stage?._id,
      },
    });
  };

  return (
    <Button onClick={onClick} className={className}>
      {children || 'Move'}
    </Button>
  );
};
