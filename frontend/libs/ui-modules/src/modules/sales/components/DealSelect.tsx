import { useState } from 'react';
import { BoardSelect } from './BoardSelect';
import { Button, Separator } from 'erxes-ui';
import { DealSelectProps } from '../types';
import { IconLoader2 } from '@tabler/icons-react';
import { PipelineSelect } from './PipelineSelect';
import { StageSelect } from './StageSelect';

export const DealSelect = ({
  boardId: initialBoardId,
  pipelineId: initialPipelineId,
  stageId: initialStageId,
  onMove,
  moveLoading,
}: DealSelectProps) => {
  const [localBoardId, setLocalBoardId] = useState(initialBoardId || '');
  const [localPipelineId, setLocalPipelineId] = useState(
    initialPipelineId || '',
  );
  const [localStageId, setLocalStageId] = useState(initialStageId || '');

  const handleBoardChange = (boardId: string | string[]) => {
    const id = Array.isArray(boardId) ? boardId[0] : boardId;
    setLocalBoardId(id);
    setLocalPipelineId('');
    setLocalStageId('');
  };

  const handlePipelineChange = (pipelineId: string | string[]) => {
    const id = Array.isArray(pipelineId) ? pipelineId[0] : pipelineId;
    setLocalPipelineId(id);
    setLocalStageId('');
  };

  const handleStageChange = (stageId: string | string[]) => {
    const id = Array.isArray(stageId) ? stageId[0] : stageId;
    setLocalStageId(id);
  };

  return (
    <div className="flex flex-col">
      <div className="px-4 py-1">
        <span className=" text-xs text-gray-400">BOARD</span>
      </div>
      <div className="px-2">
        <BoardSelect
          boardId={localBoardId}
          onChange={handleBoardChange}
          className="border-none shadow-none h-8 font-normal hover:bg-accent/50 selection:bg-transparent"
        />
      </div>
      <Separator className="mt-2 mb-1" />
      <div className="px-4 py-1 mt-1">
        <span className=" text-xs  text-gray-400">PIPELINE</span>
      </div>
      <div className="px-2">
        <PipelineSelect
          pipelineId={localPipelineId}
          onChange={handlePipelineChange}
          className="border-none shadow-none h-8 font-normal px-2 hover:bg-accent/50 w-full justify-between"
        />
      </div>
      <Separator className="mt-2 mb-1" />
      <div className="px-4 py-1 mt-1">
        <span className="text-xs  text-gray-400">STAGE</span>
      </div>
      <div className="px-2">
        <StageSelect
          stageId={localStageId}
          pipelineId={localPipelineId}
          onChange={handleStageChange}
          className="border-none shadow-none h-8 font-normal px-2 hover:bg-accent/50 w-full justify-between"
        />
      </div>
      <Separator className="mt-2 mb-1" />
      <div className="px-2 py-1">
        <Button
          className="w-full"
          size="sm"
          disabled={!localStageId || moveLoading}
          onClick={() => onMove?.(localBoardId, localPipelineId, localStageId)}
        >
          {moveLoading && <IconLoader2 className="animate-spin" size={14} />}
          Move
        </Button>
      </div>
    </div>
  );
};
