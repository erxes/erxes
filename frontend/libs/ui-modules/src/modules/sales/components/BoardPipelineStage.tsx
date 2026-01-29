import {
  dealBoardState,
  dealPipelineState,
  dealStageState,
} from '../states/dealContainerStates';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { SelectBoard } from '../select/SelectBoard';
import { SelectPipeline } from '../select/SelectPipeline';
import { SelectStage } from '../select/SelectStage';

import { Button } from 'erxes-ui';

export const BoardCell = ({
  boardId,
  className,
  onChangeBoard,
}: {
  boardId?: string;
  className?: string;
  onChangeBoard?: (boardId: string) => void;
}) => {
  const [board, setBoardId] = useAtom(dealBoardState);
  const setPipelineId = useSetAtom(dealPipelineState);
  const setStageId = useSetAtom(dealStageState);

  const value = board.boardId || boardId;

  return (
    <SelectBoard.InlineCell
      value={value}
      className={className}
      onValueChange={(boardIdValue) => {
        setBoardId({
          boardId: boardIdValue as string,
        });

        onChangeBoard?.(boardIdValue as string);

        setPipelineId({ pipelineId: '' });
        setStageId({ stageId: '' });
      }}
    />
  );
};

export const PipelineCell = ({
  boardId,
  pipelineId,
  className,
  onChangePipeline,
}: {
  boardId?: string;
  pipelineId?: string;
  className?: string;
  onChangePipeline?: (pipelineId: string) => void;
}) => {
  const board = useAtomValue(dealBoardState);
  const [pipeline, setPipelineId] = useAtom(dealPipelineState);
  const setStageId = useSetAtom(dealStageState);

  const selectedBoardId = board.boardId || boardId;
  const value = pipeline.pipelineId || pipelineId;

  return (
    <SelectPipeline.InlineCell
      value={value}
      boardId={selectedBoardId}
      className={className}
      onValueChange={(pipelineIdValue) => {
        setPipelineId({
          pipelineId: pipelineIdValue as string,
        });

        onChangePipeline?.(pipelineIdValue as string);

        setStageId({ stageId: '' });
      }}
    />
  );
};

export const StageCell = ({
  pipelineId,
  stageId,
  className,
  onChangeStage,
  onChangeValue,
}: {
  pipelineId?: string;
  stageId?: string;
  className?: string;
  onChangeStage?: (stageId: string) => void;
  onChangeValue?: () => void;
}) => {
  const pipeline = useAtomValue(dealPipelineState);
  const [stage, setStageId] = useAtom(dealStageState);

  const selectedPipelineId = pipeline.pipelineId || pipelineId;
  const value = stage.stageId || stageId;

  return (
    <SelectStage.InlineCell
      mode="single"
      value={value}
      pipelineId={selectedPipelineId}
      className={className}
      onValueChange={(stageIdValue) => {
        setStageId({
          stageId: stageIdValue as string,
        });

        onChangeStage?.(stageIdValue as string);
        onChangeValue?.();
      }}
    />
  );
};

export const SaveSelectsButton = ({
  mutation,
  className,
  name,
  itemId,
  idParamName = '_id',
  boardId,
  pipelineId,
  stageId,
}: {
  mutation: (variables: any) => void;
  className?: string;
  name?: string;
  itemId?: string;
  idParamName?: string;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
}) => {
  const board = useAtomValue(dealBoardState);
  const pipeline = useAtomValue(dealPipelineState);
  const stage = useAtomValue(dealStageState);

  const onClick = () => {
    const id = itemId;

    if (!id) return;
    console.log('clicked');

    const variables: any = {
      [idParamName]: id,
    };

    const finalBoardId = board.boardId || boardId;
    const finalPipelineId = pipeline.pipelineId || pipelineId;
    const finalStageId = stage.stageId || stageId;

    if (finalBoardId) {
      variables.boardId = finalBoardId;
    }

    if (finalPipelineId) {
      variables.pipelineId = finalPipelineId;
    }

    if (finalStageId) {
      variables.stageId = finalStageId;
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
export const SelectBoardPipelineStage = ({
  mutation,
  boardId,
  pipelineId,
  stageId,
  itemId,
  idParamName,
  onChangeBoard,
  onChangePipeline,
  onChangeStage,
}: {
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  onChangeBoard?: (boardId: string) => void;
  onChangePipeline?: (pipelineId: string) => void;
  onChangeStage?: (stageId: string) => void;
  mutation: any;
  itemId?: string;
  idParamName?: string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <BoardCell boardId={boardId} onChangeBoard={onChangeBoard} />
      <PipelineCell
        boardId={boardId}
        pipelineId={pipelineId}
        onChangePipeline={onChangePipeline}
      />
      <StageCell
        pipelineId={pipelineId}
        stageId={stageId}
        onChangeStage={onChangeStage}
      />
      <SaveSelectsButton
        mutation={mutation}
        itemId={itemId}
        idParamName={idParamName}
        boardId={boardId}
        pipelineId={pipelineId}
        stageId={stageId}
      />
    </div>
  );
};
