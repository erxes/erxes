import {
  Button,
  Collapsible,
  DropdownMenu,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  cn,
  useMultiQueryState,
  useQueryState,
  useToast,
} from 'erxes-ui';
import {
  IconCaretRightFilled,
  IconDotsVertical,
  IconLink,
  IconSettings,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IBoard } from '@/deals/types/boards';
import { useBoards } from '~/modules/deals/boards/hooks/useBoards';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type TBoardSelection = {
  boardId: string;
  pipelineId: string;
  stageId: string;
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
  );
}

function BoardItem({ board }: { board: IBoard }) {
  const { t } = useTranslation('sales');
  const [{ boardId, pipelineId }, setBoardSelection] =
    useMultiQueryState<TBoardSelection>(['boardId', 'pipelineId', 'stageId']);

  const isActive = boardId === board._id;
  const pipelines = (board.pipelines || []).filter(
    (pipeline) => pipeline.status !== 'archived',
  );

  const [open, setOpen] = useState(isActive);

  // Board selection can arrive after mount (restored from localStorage), so
  // keep opening the active board instead of relying on defaultOpen alone.
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const handleBoardClick = () => {
    if (board._id === boardId) return;

    const nextPipelineId = pipelines[0]?._id || null;

    localStorage.setItem('erxesCurrentBoardId', board._id);
    localStorage.removeItem('erxesCurrentPipelineId');
    setBoardSelection({
      boardId: board._id,
      pipelineId: nextPipelineId,
      stageId: null,
    });
  };

  const handlePipelineClick = (nextPipelineId: string) => {
    localStorage.setItem('erxesCurrentBoardId', board._id);
    localStorage.setItem('erxesCurrentPipelineId', nextPipelineId);
    setBoardSelection({
      boardId: board._id,
      pipelineId: nextPipelineId,
      stageId: null,
    });
  };

  return (
    <Collapsible
      className="group/collapsible"
      open={open}
      onOpenChange={setOpen}
    >
      <Sidebar.Group className="p-0">
        <Collapsible.Trigger asChild>
          <div className="w-full flex items-center justify-between">
            <Button
              variant="ghost"
              className={cn(
                'px-2 flex min-w-0 flex-1 justify-start',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/10',
              )}
              onClick={handleBoardClick}
            >
              <TextOverflowTooltip
                className="font-sans font-semibold normal-case text-left flex-1 min-w-0"
                value={board.name}
              />
              <span className="ml-auto">
                <IconCaretRightFilled
                  className={cn(
                    'size-3 transition-transform group-data-[state=open]/collapsible:rotate-90',
                    isActive ? 'text-primary' : 'text-accent-foreground',
                  )}
                />
              </span>
            </Button>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content className="pt-1">
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {pipelines.map((pipeline) => (
                <Sidebar.MenuItem key={pipeline._id}>
                  <Sidebar.MenuButton
                    className="pl-6 font-medium"
                    isActive={isActive && pipelineId === pipeline._id}
                    onClick={() => handlePipelineClick(pipeline._id)}
                  >
                    <TextOverflowTooltip
                      className="capitalize flex-1 min-w-0"
                      value={pipeline.name}
                    />
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
              {!pipelines.length && (
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton className="pl-6" disabled>
                    <span className="capitalize text-foreground">
                      {t('no-pipelines')}
                    </span>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              )}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
}

const ActionsMenu = () => {
  const navigate = useNavigate();

  const { toast } = useToast();

  const { t } = useTranslation('sales');

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/settings/deals`;

    try {
      await navigator.clipboard.writeText(link);
      toast({
        variant: 'default',
        title: t('link-copied-to-clipboard'),
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: t('failed-to-copy-link'),
        description: e as string,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="invisible group-hover/trigger:visible absolute top-1/2 -translate-y-1/2 right-1 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="right" align="start" className="w-60 min-w-0">
        <DropdownMenu.Item
          className="cursor-pointer"
          onSelect={() => {
            navigate(`/settings/deals`);
          }}
        >
          <IconSettings className="size-4" />
          {t('manage-board-pipelines')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => {
            handleCopyLink();
          }}
          className="cursor-pointer"
        >
          <IconLink className="size-4" />
          {t('copy-link')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const DealsNavigation = () => {
  const { boards, loading } = useBoards();
  const [boardId, setBoardId] = useQueryState<string | null>('boardId');
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );
  const { t } = useTranslation('sales');

  useEffect(() => {
    if (!boards || boards.length === 0) return;

    const storedBoardId = localStorage.getItem('erxesCurrentBoardId');

    if (!boardId && storedBoardId) {
      setBoardId(storedBoardId);
      return;
    }

    if (!boardId && boards[0]?._id) {
      setBoardId(boards[0]._id);
    }
  }, [boards, setBoardId, boardId]);

  // Keep the selected pipeline within the selected board.
  useEffect(() => {
    if (!boards || boards.length === 0 || !boardId) return;

    const currentBoard = boards.find((board) => board._id === boardId);

    if (!currentBoard) return;

    const pipelines = (currentBoard.pipelines || []).filter(
      (pipeline) => pipeline.status !== 'archived',
    );

    if (pipelines.some((pipeline) => pipeline._id === pipelineId)) return;

    const storedPipelineId = localStorage.getItem('erxesCurrentPipelineId');
    const storedPipeline = pipelines.find(
      (pipeline) => pipeline._id === storedPipelineId,
    );

    setPipelineId(storedPipeline?._id || pipelines[0]?._id || null);
  }, [boards, boardId, pipelineId, setPipelineId]);

  return (
    <NavigationMenuGroup name={t('boards')} actions={<ActionsMenu />}>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        boards?.map((board) => <BoardItem key={board._id} board={board} />)
      )}
    </NavigationMenuGroup>
  );
};

export function SalesSubNavigation() {
  const location = useLocation();
  const isDeals = location.pathname.startsWith('/sales/deals');

  if (!isDeals) return null;

  return <DealsNavigation />;
}