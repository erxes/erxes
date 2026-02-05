import { useAtomValue, useSetAtom } from 'jotai';

import { SelectBoard } from './common/select/SelectBoards';
import { dealBoardState } from '../states/dealContainerState';
import { useEffect } from 'react';

export const BoardSelect = ({
  boardId,
  className,
  onChange,
}: {
  boardId?: string;
  className?: string;
  onChange?: (boardId: string | string[], callback?: () => void) => void;
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
      value={boardId || currentBoard?.boardId || ''}
      className={className}
      onValueChange={(boardId) => {
        setBoardId({
          boardId: boardId as string,
        });
        onChange?.(boardId);
      }}
    />
  );
};
