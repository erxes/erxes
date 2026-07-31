import { useBoards } from '@/deals/boards/hooks/useBoards';
import { resolveSalesBoardSelection } from '@/deals/boards/hooks/salesBoardSelection';
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
    if (!boards) {
      return;
    }

    const selection = resolveSalesBoardSelection(boards, boardId, pipelineId);

    if (!selection) {
      return;
    }

    localStorage.setItem(CURRENT_BOARD_STORAGE_KEY, selection.boardId);

    if (selection.pipelineId) {
      localStorage.setItem(CURRENT_PIPELINE_STORAGE_KEY, selection.pipelineId);
    } else {
      localStorage.removeItem(CURRENT_PIPELINE_STORAGE_KEY);
    }

    if (boardId === selection.boardId && pipelineId === selection.pipelineId) {
      return;
    }

    setSearchParams(
      (currentSearchParams) => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);

        nextSearchParams.set('boardId', selection.boardId);

        if (selection.pipelineId) {
          nextSearchParams.set('pipelineId', selection.pipelineId);
        } else {
          nextSearchParams.delete('pipelineId');
        }

        return nextSearchParams;
      },
      { replace: true },
    );
  }, [boardId, boards, pipelineId, setSearchParams]);
};
