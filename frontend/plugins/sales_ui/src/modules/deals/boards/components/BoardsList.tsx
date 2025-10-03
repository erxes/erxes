import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, Skeleton, useConfirm, useQueryState } from 'erxes-ui';
import { useBoardRemove, useBoards } from '@/deals/boards/hooks/useBoards';
import { useEffect, useMemo } from 'react';

import { BoardForm } from './BoardForm';
import { IBoard } from '@/deals/types/boards';

export const BoardsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const activeBoardId = searchParams.get('activeBoardId');

  const { boards, loading } = useBoards();

  useEffect(() => {
    if (!loading && boards && boards.length > 0 && !activeBoardId) {
      const firstBoardId = boards[0]._id;
      searchParams.set('activeBoardId', firstBoardId);
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [boards, loading, activeBoardId, navigate, location, searchParams]);

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <div className="w-full flex items-center justify-between">
          <Sidebar.GroupLabel>
            Boards ({boards?.length || 0})
          </Sidebar.GroupLabel>
          <BoardForm />
        </div>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {boards &&
              boards.map((board) => (
                <Sidebar.MenuItem key={board._id}>
                  <BoardMenuItem board={board} />
                </Sidebar.MenuItem>
              ))}
            {loading &&
              Array.from({ length: 10 }).map((_, index) => (
                <Sidebar.MenuItem key={index}>
                  <Skeleton className="w-full h-4 my-1" />
                </Sidebar.MenuItem>
              ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const BoardMenuItem = ({ board }: { board: IBoard }) => {
  const [activeBoardId] = useQueryState('activeBoardId');
  const [, setBoardId] = useQueryState('boardId');

  const isActive = board._id === activeBoardId;

  const { removeBoard, loading: removeLoading } = useBoardRemove();

  const { confirm } = useConfirm();

  const onRemove = (boardId: string) => {
    confirm({
      message: `Are you sure you want to delete ${board.name}?`,
    }).then(() => {
      removeBoard({ variables: { _id: boardId } });
    });
  };

  return (
    <div className="group relative flex items-center justify-between w-full hover:bg-gray-100 transition-colors duration-200">
      <Link
        className="w-full"
        to={`/settings/deals?activeBoardId=${board._id}`}
      >
        <Sidebar.MenuButton isActive={isActive}>
          {board.name}
        </Sidebar.MenuButton>
      </Link>
      <div className="absolute right-0 flex items-center gap-1 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pr-2">
        <button
          onClick={() => setBoardId(board._id)}
          className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
        >
          <IconPencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRemove(board._id)}
          disabled={removeLoading}
          className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
