import { useAtomValue, useSetAtom } from 'jotai';

import { SelectBoard } from './common/select/SelectBoards';
import { dealBoardState } from '../states/dealContainerState';
import { useEffect } from 'react';

export const BoardSelect = ({
  boardId,
  className,
}: {
  boardId?: string;
  className?: string;
}) => {
  const setBoardId = useSetAtom(dealBoardState);
  const currentBoard = useAtomValue(dealBoardState);

  useEffect(() => {
    if (boardId) {
      setBoardId({ boardId });
    }
  }, [boardId, setBoardId]);

  return (
    <SelectBoard
      value={currentBoard?.boardId || boardId || ''}
      className={className}
      onValueChange={(boardId) => {
        setBoardId({
          boardId: boardId as string,
        });
      }}
    />
  );
};
