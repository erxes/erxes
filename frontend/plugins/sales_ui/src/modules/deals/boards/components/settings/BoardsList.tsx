import {
  Badge,
  DropdownMenu,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBoardRemove, useBoards } from '@/deals/boards/hooks/useBoards';
import { useEffect, useMemo } from 'react';

import { BoardArchiveMenuItem } from './BoardArchiveMenuItem';
import { BoardForm } from '@/deals/boards/components/settings/BoardForm';
import { IBoard } from '@/deals/types/boards';
import { useBoardArchiveSubscription } from '@/deals/boards/hooks/useBoardArchiveSubscription';
import { useTranslation } from 'react-i18next';

export const BoardsList = () => {
  useBoardArchiveSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const activeBoardId = searchParams.get('activeBoardId');

  const { boards, loading, error } = useBoards({
    variables: { includeArchived: true },
  });

  useEffect(() => {
    if (
      !loading &&
      !error &&
      boards &&
      !boards.some((board) => board._id === activeBoardId)
    ) {
      const firstBoardId = boards[0]?._id;
      if (firstBoardId) searchParams.set('activeBoardId', firstBoardId);
      else if (activeBoardId) searchParams.delete('activeBoardId');
      else return;
      searchParams.delete('pipelineId');
      searchParams.delete('tab');
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [boards, loading, error, activeBoardId, navigate, location, searchParams]);

  const { t } = useTranslation('sales');

  return (
    <Sidebar.Panel
      className="flex-none border-r"
      label={`${t('boards')} (${boards?.length || 0})`}
      actions={<BoardForm />}
    >
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {boards?.map((board) => (
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
            {error && (
              <p className="p-3 text-sm text-destructive">{error.message}</p>
            )}
            {!loading && !error && !boards?.length && (
              <p className="p-3 text-sm text-muted-foreground">
                {t('no-boards', 'No boards')}
              </p>
            )}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Panel>
  );
};

const BoardMenuItem = ({ board }: { board: IBoard }) => {
  const [activeBoardId] = useQueryState('activeBoardId');
  const [, setBoardId] = useQueryState<string>('boardId');
  const { t } = useTranslation('sales');

  const isActive = board._id === activeBoardId;
  const isArchived = board?.status === 'archived';

  const { removeBoard, loading: removeLoading } = useBoardRemove();

  const { confirm } = useConfirm();

  const onRemove = (boardId: string) => {
    confirm({
      message: t('delete-board-confirm', { name: board.name }),
    }).then(() => {
      removeBoard({ variables: { _id: boardId } });
    });
  };

  return (
    <>
      <Sidebar.MenuButton asChild className="h-8" isActive={isActive}>
        <Link to={`/settings/sales/deals?activeBoardId=${board._id}`}>
          <TextOverflowTooltip
            value={board.name}
            className="min-w-0 flex-1 text-left"
          />
          {isArchived && (
            <Badge
              variant="warning"
              className="h-5 shrink-0 border-yellow-200 bg-yellow-100 text-yellow-800"
            >
              {t('archived', 'Archived')}
            </Badge>
          )}
        </Link>
      </Sidebar.MenuButton>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Sidebar.MenuAction
            showOnHover
            aria-label={`${board.name}: ${t('action')}`}
            disabled={removeLoading}
            className="text-muted-foreground"
          >
            <IconDots />
          </Sidebar.MenuAction>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" sideOffset={8} className="min-w-72">
          <DropdownMenu.Item onSelect={() => setBoardId(board._id)}>
            <IconPencil />
            {t('edit')}
          </DropdownMenu.Item>
          <BoardArchiveMenuItem board={board} disabled={removeLoading} />
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onSelect={() => onRemove(board._id)}
            disabled={removeLoading}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash />
            {t('delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
};
