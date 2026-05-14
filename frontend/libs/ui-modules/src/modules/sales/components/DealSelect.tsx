import { BoardSelect } from './BoardSelect';
import { DealSelectProps } from '../types';
import { PipelineSelect } from './PipelineSelect';
import { Separator } from 'erxes-ui';
import { StageSelect } from './StageSelect';

export const DealSelect = ({
  boardId,
  pipelineId,
  stageId,
  onChangeStage,
  onChangePipeline,
  onChangeBoard,
}: DealSelectProps) => {
  return (
    <div className="flex flex-col">
      <div className="px-4 py-1">
        <span className=" text-xs text-gray-400">BOARD</span>
      </div>
      <div className="px-2">
        <BoardSelect
          boardId={boardId}
          onChange={onChangeBoard}
          className="border-none shadow-none h-8 font-normal hover:bg-accent/50 selection:bg-transparent"
        />
      </div>
      <Separator className="mt-2 mb-1" />

      <div className="px-4 py-1 mt-1">
        <span className=" text-xs  text-gray-400">PIPELINE</span>
      </div>
      <div className="px-2">
        <PipelineSelect
          pipelineId={pipelineId}
          onChange={onChangePipeline}
          className="border-none shadow-none h-8 font-normal px-2 hover:bg-accent/50 w-full justify-between"
        />
      </div>
      <Separator className="mt-2 mb-1" />
      <div className="px-4 py-1 mt-1">
        <span className="text-xs  text-gray-400">STAGE</span>
      </div>
      <div className="px-2">
        <StageSelect
          stageId={stageId}
          pipelineId={pipelineId}
          onChange={onChangeStage}
          className="border-none shadow-none h-8 font-normal px-2 hover:bg-accent/50 w-full justify-between"
        />
      </div>
      <Separator className="mt-2" />
    </div>
  );
};
