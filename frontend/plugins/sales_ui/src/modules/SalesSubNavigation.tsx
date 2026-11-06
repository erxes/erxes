import {
  IconChevronRight,
  IconCoins,
  IconDotsVertical,
  IconLink,
  IconSettings,
} from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  DropdownMenu,
  NavigationMenuGroup,
  NavigationMenuLinkItem,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  cn,
  isDefined,
  useMultiQueryState,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { IBoard } from '@/deals/types/boards';
import { useBoardArchiveSubscription } from '@/deals/boards/hooks/useBoardArchiveSubscription';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBoards } from '@/deals/boards/hooks/useBoards';
import { useLoyaltyEnabled } from '@/deals/loyaltyRules/hooks/useLoyaltyEnabled';

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

// Elsewhere in the module (Loyalty points) a board opens the deals page.
const DEALS_PATH = '/sales/deals';

function BoardItem({
  board,
  onDealsPage,
}: {
  board: IBoard;
  onDealsPage: boolean;
}) {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const [{ boardId, pipelineId }, setBoardSelection] =
    useMultiQueryState<TBoardSelection>(['boardId', 'pipelineId', 'stageId']);

  const isActive = onDealsPage && boardId === board._id;
  const pipelines = (board.pipelines?.filter(isDefined) || []).filter(
    (pipeline) => pipeline.status !== 'archived',
  );

  const [open, setOpen] = useState(isActive);

  // Board selection can arrive after mount (restored from localStorage), so
  // keep opening the active board instead of relying on defaultOpen alone.
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const openDeals = (nextPipelineId: string | null) => {
    const params = new URLSearchParams({ boardId: board._id });

    if (nextPipelineId) params.set('pipelineId', nextPipelineId);
    navigate(`${DEALS_PATH}?${params.toString()}`);
  };

  const handleBoardClick = () => {
    if (onDealsPage && board._id === boardId) return;

    const nextPipelineId = pipelines[0]?._id || null;

    localStorage.setItem('erxesCurrentBoardId', board._id);
    localStorage.removeItem('erxesCurrentPipelineId');

    if (!onDealsPage) {
      openDeals(nextPipelineId);
      return;
    }

    setBoardSelection({
      boardId: board._id,
      pipelineId: nextPipelineId,
      stageId: null,
    });
  };

  const handlePipelineClick = (nextPipelineId: string) => {
    localStorage.setItem('erxesCurrentBoardId', board._id);
    localStorage.setItem('erxesCurrentPipelineId', nextPipelineId);

    if (!onDealsPage) {
      openDeals(nextPipelineId);
      return;
    }

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
                'px-2 flex min-w-0 flex-1 justify-start rounded-lg',
                isActive &&
                  'bg-foreground/5 text-foreground hover:bg-foreground/5',
              )}
              onClick={handleBoardClick}
            >
              <TextOverflowTooltip
                className="font-sans font-semibold normal-case text-left flex-1 min-w-0"
                value={board.name}
              />
              <span className="ml-auto flex shrink-0 text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none">
                <IconChevronRight className="size-3.5!" />
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
                      className="flex-1 min-w-0"
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

const DealsNavigation = ({ onDealsPage }: { onDealsPage: boolean }) => {
  useBoardArchiveSubscription();
  const { boards, loading, error } = useBoards();
  const [boardId, setBoardId] = useQueryState<string | null>('boardId');
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );
  const { t } = useTranslation('sales');

  // Only the deals page is scoped to one board and pipeline.
  useEffect(() => {
    if (!onDealsPage) return;
    if (!boards || boards.some((board) => board._id === boardId)) return;

    const storedBoardId = localStorage.getItem('erxesCurrentBoardId');
    const storedBoard = boards.find((board) => board._id === storedBoardId);
    const nextBoardId = storedBoard?._id || boards[0]?._id || null;
    if (nextBoardId !== boardId) setBoardId(nextBoardId, { replace: true });
  }, [boards, setBoardId, boardId, onDealsPage]);

  // Keep the selected pipeline within the selected board.
  useEffect(() => {
    if (!onDealsPage || !boards) return;
    if (boards.length === 0 || !boardId) {
      if (pipelineId) setPipelineId(null);
      return;
    }

    const currentBoard = boards.find((board) => board._id === boardId);

    if (!currentBoard) return;

    const pipelines = (currentBoard.pipelines?.filter(isDefined) || []).filter(
      (pipeline) => pipeline.status !== 'archived',
    );

    if (pipelines.some((pipeline) => pipeline._id === pipelineId)) return;

    const storedPipelineId = localStorage.getItem('erxesCurrentPipelineId');
    const storedPipeline = pipelines.find(
      (pipeline) => pipeline._id === storedPipelineId,
    );

    const nextPipelineId = storedPipeline?._id || pipelines[0]?._id || null;
    if (nextPipelineId !== pipelineId) {
      setPipelineId(nextPipelineId, { replace: true });
    }
  }, [boards, boardId, pipelineId, setPipelineId, onDealsPage]);

  return (
    <NavigationMenuGroup name={t('boards')} actions={<ActionsMenu />}>
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <p className="p-2 text-sm text-destructive">{error.message}</p>
      ) : !boards?.length ? (
        <p className="p-2 text-sm text-muted-foreground">
          {t('no-boards', 'No boards')}
        </p>
      ) : (
        boards?.map((board) => (
          <BoardItem key={board._id} board={board} onDealsPage={onDealsPage} />
        ))
      )}
    </NavigationMenuGroup>
  );
};

export function SalesSubNavigation() {
  const location = useLocation();
  const isDeals = location.pathname.startsWith(DEALS_PATH);
  const loyaltyEnabled = useLoyaltyEnabled();
  const { t } = useTranslation('sales');

  if (!isDeals) return null;

  return (
    <>
      {loyaltyEnabled && (
        <>
          {/* Sets the module's own pages apart from the plugin menu above. */}
          <Sidebar.Separator />
          <Sidebar.Group className="px-2 py-1">
            <Sidebar.GroupContent>
              <Sidebar.Menu>
                <NavigationMenuLinkItem
                  name={t('loyalty-deal-points')}
                  path="sales/deals/loyalty"
                  icon={IconCoins}
                />
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </>
      )}
      <DealsNavigation
        onDealsPage={location.pathname.replace(/\/$/, '') === DEALS_PATH}
      />
    </>
  );
}
