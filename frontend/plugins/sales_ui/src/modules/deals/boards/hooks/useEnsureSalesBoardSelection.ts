import { useBoards } from '@/deals/boards/hooks/useBoards';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const CURRENT_BOARD_STORAGE_KEY = 'erxesCurrentBoardId';
const CURRENT_PIPELINE_STORAGE_KEY = 'erxesCurrentPipelineId';

export const useEnsureSalesBoardSelection = () => {
  const { boards } = useBoards();
  const [searchParams, setSearchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');
  const pipelineId = searchParams.get('pipelineId');

  useEffect(() => {
    if (!boards?.length) {
      return;
    }

    const storedBoardId = localStorage.getItem(CURRENT_BOARD_STORAGE_KEY);
    const storedPipelineId = localStorage.getItem(
      CURRENT_PIPELINE_STORAGE_KEY,
    );
    const selectedBoard =
      boards.find((board) => board._id === boardId) ??
      boards.find((board) => board._id === storedBoardId) ??
      boards[0];
    const pipelines = selectedBoard.pipelines || [];
    const selectedPipeline =
      pipelines.find((pipeline) => pipeline._id === pipelineId) ??
      pipelines.find((pipeline) => pipeline._id === storedPipelineId) ??
      pipelines[0];
    const selectedPipelineId = selectedPipeline?._id || null;

    if (
      boardId === selectedBoard._id &&
      pipelineId === selectedPipelineId
    ) {
      return;
    }

    setSearchParams(
      (currentSearchParams) => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);

        nextSearchParams.set('boardId', selectedBoard._id);

        if (selectedPipelineId) {
          nextSearchParams.set('pipelineId', selectedPipelineId);
        } else {
          nextSearchParams.delete('pipelineId');
        }

        return nextSearchParams;
      },
      { replace: true },
    );
    localStorage.setItem(CURRENT_BOARD_STORAGE_KEY, selectedBoard._id);

    if (selectedPipelineId) {
      localStorage.setItem(
        CURRENT_PIPELINE_STORAGE_KEY,
        selectedPipelineId,
      );
    } else {
      localStorage.removeItem(CURRENT_PIPELINE_STORAGE_KEY);
    }
  }, [boardId, boards, pipelineId, setSearchParams]);
};
