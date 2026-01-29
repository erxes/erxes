import {
  dealBoardState,
  dealPipelineState,
  dealStageState,
} from '../states/dealContainerStates';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { IDeal } from '../types/deals';
import { SelectBoard } from '../select/SelectBoard';
import { SelectPipeline } from '../select/SelectPipeline';
import { SelectStage } from '../select/SelectStage';

import { Button } from 'erxes-ui';
import { useBoards } from '../hooks/useBoards';

export const BoardCell = ({
  deal,
  className,
}: {
  deal?: IDeal;
  className?: string;
}) => {
  const { boards } = useBoards();

  const [board, setBoardId] = useAtom(dealBoardState);
  const setPipelineId = useSetAtom(dealPipelineState);
  const setStageId = useSetAtom(dealStageState);

  if (!boards) return null;

  const value = board.boardId || deal?.boardId;

  return (
    <SelectBoard.InlineCell
      value={value}
      className={className}
      onValueChange={(boardId) => {
        setBoardId({
          boardId: boardId as string,
        });

        setPipelineId({ pipelineId: '' });
        setStageId({ stageId: '' });
      }}
    />
  );
};

export const PipelineCell = ({
  deal,
  className,
}: {
  deal?: IDeal;
  className?: string;
}) => {
  const board = useAtomValue(dealBoardState);
  const [pipeline, setPipelineId] = useAtom(dealPipelineState);
  const setStageId = useSetAtom(dealStageState);

  const boardId = board.boardId || deal?.boardId;
  const value = pipeline.pipelineId || deal?.pipeline?._id;

  return (
    <SelectPipeline.InlineCell
      value={value}
      boardId={boardId}
      className={className}
      onValueChange={(pipelineId) => {
        setPipelineId({
          pipelineId: pipelineId as string,
        });

        setStageId({ stageId: '' });
      }}
    />
  );
};

export const StageCell = ({
  deal,
  className,
}: {
  className?: string;
  deal?: IDeal;
}) => {
  const pipeline = useAtomValue(dealPipelineState);
  const [stage, setStageId] = useAtom(dealStageState);

  const pipelineId = pipeline.pipelineId || deal?.pipeline?._id;
  const value = stage.stageId || deal?.stage?._id;

  return (
    <SelectStage.InlineCell
      mode="single"
      value={value}
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
interface ISaveSelectsButton {
  mutation: (variables: any) => void;
  className?: string;
  name?: string;
  itemId?: string;
  idParamName?: string;
}
export const SaveSelectsButton = ({
  mutation,
  className,
  name,
  itemId,
  idParamName = '_id',
}: ISaveSelectsButton) => {
  const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);
  const stage = useAtomValue(dealStageState);

  const onClick = () => {
    const id = itemId;

    if (!id) return;

    const variables: any = {
      [idParamName]: id,
    };

    const boardId = board.boardId;
    const pipelineId = pipeline.pipelineId;
    const stageId = stage.stageId;

    if (boardId) {
      variables.boardId = boardId;
    }

    if (pipelineId) {
      variables.pipelineId = pipelineId;
    }

    if (stageId) {
      variables.stageId = stageId;
    }

    mutation({
      variables,
    });
  };

  return (
    <Button onClick={onClick} className={className}>
      {name || 'Move'}
    </Button>
  );
};
