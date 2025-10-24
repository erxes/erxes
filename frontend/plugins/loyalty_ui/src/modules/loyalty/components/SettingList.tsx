import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, Skeleton, useConfirm, useQueryState } from 'erxes-ui';
// import { useBoardRemove, useBoards } from '@/deals/boards/hooks/useBoards';
import { useEffect, useMemo } from 'react';
import { MENU_ITEMS } from '~/constants';

// import { BoardForm } from './BoardForm';
// import { IBoard } from '@/deals/types/boards';

export const SettingsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  // useEffect(() => {
  //   if (!loading && boards && boards.length > 0 && !activeBoardId) {
  //     const firstBoardId = boards[0]._id;
  //     searchParams.set('activeBoardId', firstBoardId);
  //     navigate(`${location.pathname}?${searchParams.toString()}`, {
  //       replace: true,
  //     });
  //   }
  // }, [boards, loading, activeBoardId, navigate, location, searchParams]);

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <div className="w-full flex items-center justify-between">
          <Sidebar.GroupLabel>
            Types ({MENU_ITEMS?.length || 0})
          </Sidebar.GroupLabel>
        </div>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {MENU_ITEMS.map((board) => (
              <Sidebar.MenuItem key={board.name}>
                <BoardMenuItem board={board} />
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

const BoardMenuItem = ({
  board,
}: {
  board: { name: string; link: string };
}) => {
  return (
    <div className="group relative flex items-center justify-between w-full hover:bg-gray-100 transition-colors duration-200">
      <Link className="w-full" to={`/settings/loyalty?type=${board.link}`}>
        <Sidebar.MenuButton className="h-auto" isActive={false}>
          {board.name}
        </Sidebar.MenuButton>
      </Link>
      <div
        className={`absolute right-0 top-0 bottom-0 flex items-center gap-1 opacity-0 ${
          false ? 'bg-primary/20' : 'bg-gray-100'
        } translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pr-2`}
      >
        <button
          onClick={() => {}}
          className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
        >
          <IconPencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
