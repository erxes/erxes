import {
  BoardsInlineContext,
  useBoardsInlineContext,
} from '@/deals/context/BoardsInlineContext';
import { BoardsInlineProps, IBoard } from '@/deals/types/boards';
import {
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
  isUndefinedOrNull,
} from 'erxes-ui';
import { useEffect, useState } from 'react';

import { useBoardDetail } from '@/deals/boards/hooks/useBoards';

const BoardsInlineRoot = (props: BoardsInlineProps) => {
  return (
    <BoardsInlineProvider {...props}>
      <BoardsInlineTitle />
    </BoardsInlineProvider>
  );
};

const BoardsInlineProvider = ({
  children,
  boardIds,
  boards,
  placeholder,
  updateBoards,
}: BoardsInlineProps & {
  children?: React.ReactNode;
}) => {
  const [_boards, _setBoards] = useState<IBoard[]>(boards || []);

  useEffect(() => {
    if (boards) return;

    if (!boardIds?.length) {
      _setBoards([]);
      return;
    }

    _setBoards((prev) => prev.filter((board) => boardIds.includes(board._id)));
  }, [boardIds, boards]);

  return (
    <BoardsInlineContext.Provider
      value={{
        boards: boards || _boards,
        loading: false,
        boardIds: boardIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select boards'
          : placeholder,
        updateBoards: updateBoards || _setBoards,
      }}
    >
      {children}
      {boardIds?.map((boardId) => (
        <BoardsInlineEffectComponent key={boardId} boardId={boardId} />
      ))}
    </BoardsInlineContext.Provider>
  );
};

const BoardsInlineEffectComponent = ({ boardId }: { boardId: string }) => {
  const { boards, updateBoards } = useBoardsInlineContext();
  const { boardDetail } = useBoardDetail({
    variables: {
      _id: boardId,
    },
  });

  useEffect(() => {
    const newBoards = [...boards].filter((b) => b._id !== boardId);

    if (boardDetail) {
      updateBoards?.([...newBoards, boardDetail]);
    }
  }, [boardDetail, boards, updateBoards, boardId]);

  return null;
};

const BoardsInlineTitle = () => {
  const { boards, loading, placeholder } = useBoardsInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (boards.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (boards.length < 3) {
    return <TextOverflowTooltip value={boards.map((b) => b.name).join(', ')} />;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${boards.length} boards`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {boards.map((board) => board.name).join(', ')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const BoardsInline = Object.assign(BoardsInlineRoot, {
  Provider: BoardsInlineProvider,
  Title: BoardsInlineTitle,
});
