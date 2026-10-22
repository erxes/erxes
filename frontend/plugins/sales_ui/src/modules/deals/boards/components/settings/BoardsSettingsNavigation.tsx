import {
  Badge,
  Button,
  DropdownMenu,
  NavigationMenuGroup,
  Sidebar,
  TextOverflowTooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { IconDots, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBoardRemove, useBoards } from '@/deals/boards/hooks/useBoards';
import { useEffect, useMemo } from 'react';

import { BoardArchiveMenuItem } from './BoardArchiveMenuItem';
import { IBoard } from '@/deals/types/boards';
import { useBoardArchiveSubscription } from '@/deals/boards/hooks/useBoardArchiveSubscription';
import { useTranslation } from 'react-i18next';

/**
 * Keeps `activeBoardId` on an existing board (the first one by default) and
 * the boards list fresh across archive changes, for the deals settings page.
 */
export const useSettingsActiveBoard = () => {
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
};

const DEALS_SETTINGS_PATH = '/sales/settings/deals';

function BoardsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Sidebar.MenuSkeleton className="h-7" />
      <Sidebar.MenuSkeleton className="h-7 pl-6" />
      <Sidebar.MenuSkeleton className="h-7 pl-6" />
      <Sidebar.MenuSkeleton className="h-7" />
    </div>
  );
}

/**
 * The BOARDS group of the sales settings sidebar, laid out like the deals
 * app sidebar, so the deals settings page needs no boards side panel.
 */
export const BoardsSettingsNavigation = () => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const location = useLocation();
  // Only the deals settings page shows its boards.
  const onDealsPage = location.pathname === DEALS_SETTINGS_PATH;
  const { boards, loading, error } = useBoards({
    variables: { includeArchived: true },
    skip: !onDealsPage,
  });

  if (!onDealsPage) {
    return null;
  }

  const renderBoards = () => {
    if (loading) return <BoardsLoadingSkeleton />;
    if (error) {
      return <p className="p-2 text-sm text-destructive">{error.message}</p>;
    }
    if (!boards?.length) {
      return (
        <p className="p-2 text-sm text-muted-foreground">
          {t('no-boards', 'No boards')}
        </p>
      );
    }
    // `border-l` draws the vertical guide, as in the settings sidebar.
    return (
      <Sidebar.Sub className="border-l">
        {boards.map((board) => (
          <BoardMenuItem key={board._id} board={board} />
        ))}
      </Sidebar.Sub>
    );
  };

  return (
    <NavigationMenuGroup
      name={t('boards')}
      actions={
        <Button
          variant="ghost"
          size="icon"
          // `visible` overrides the group's hover-only actions slot.
          className="visible text-muted-foreground"
          aria-label={t('add-board')}
          onClick={(event) => {
            // The actions sit inside the group's collapse trigger.
            event.stopPropagation();
            // Stay on the selected board.
            const params = new URLSearchParams(location.search);
            params.set('createBoard', '1');
            navigate(`${DEALS_SETTINGS_PATH}?${params.toString()}`);
          }}
        >
          <IconPlus className="size-4" />
        </Button>
      }
    >
      {renderBoards()}
    </NavigationMenuGroup>
  );
};

// One board row, as in the deals app sidebar: the name selects it (its
// pipelines show in the page table), `⋯` edits it.
const BoardMenuItem = ({ board }: { board: IBoard }) => {
  const [activeBoardId] = useQueryState('activeBoardId');
  const [, setBoardId] = useQueryState<string>('boardId');
  const { t } = useTranslation('sales');

  const isActive = board._id === activeBoardId;
  const isArchived = board?.status === 'archived';
  const boardPath = `${DEALS_SETTINGS_PATH}?activeBoardId=${board._id}`;

  const { removeBoard, loading: removeLoading } = useBoardRemove();

  const { confirm } = useConfirm();

  const onRemove = (boardId: string) => {
    confirm({
      message: t('delete-board-confirm', { name: board.name }),
    }).then(() => {
      removeBoard({ variables: { _id: boardId } });
    });
  };

  const actionClassName =
    'size-6 shrink-0 text-muted-foreground hover:bg-transparent hover:text-foreground';

  return (
    <Sidebar.SubItem className="group/board-row relative">
      <Sidebar.SubButton asChild className="pr-8" isActive={isActive}>
        <Link to={boardPath}>
          <TextOverflowTooltip
            className="min-w-0 flex-1 text-left"
            value={board.name}
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
      </Sidebar.SubButton>
      {/* Shown on hover or focus, over the row's right end. */}
      <div className="absolute right-0.5 top-0.5 hidden items-center group-hover/board-row:flex group-focus-within/board-row:flex has-[[data-state=open]]:flex">
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={actionClassName}
              aria-label={`${board.name}: ${t('action')}`}
              disabled={removeLoading}
            >
              <IconDots className="size-4" />
            </Button>
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
      </div>
    </Sidebar.SubItem>
  );
};
