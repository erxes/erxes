import { IconChevronRight, IconCoins, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  NavigationMenuGroup,
  NavigationMenuLinkItem,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  cn,
  isDefined,
  isUndefinedOrNull,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  BoardCreateDialog,
  BoardsNavigationActions,
} from '@/deals/boards/components/BoardsNavigationActions';
import { useBoardDealCounts } from '@/deals/boards/hooks/useBoardDealCounts';
import { PipelineCreateSheet } from '@/deals/pipelines/components/PipelineCreateSheet';
import { pipelineCreateBoardIdState } from '@/deals/states/pipelineCreateSheetState';
import { IBoard } from '@/deals/types/boards';
import { useBoardArchiveSubscription } from '@/deals/boards/hooks/useBoardArchiveSubscription';
import { useSetAtom } from 'jotai';
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
    <div className="flex flex-col gap-1">
      <Sidebar.MenuSkeleton className="h-7" />
      <Sidebar.MenuSkeleton className="h-7 pl-6" />
      <Sidebar.MenuSkeleton className="h-7 pl-6" />
      <Sidebar.MenuSkeleton className="h-7" />
    </div>
  );
}

// Elsewhere in the module (Loyalty points) a board opens the deals page.
const DEALS_PATH = '/sales/deals';

function DealCount({
  count,
  loading,
}: Readonly<{ count?: number; loading: boolean }>) {
  if (isUndefinedOrNull(count)) {
    return loading ? (
      <Skeleton className="size-4 shrink-0 rounded-full" />
    ) : null;
  }

  return (
    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
      {count}
    </span>
  );
}

function BoardItem({
  board,
  onDealsPage,
  pipelineCounts,
  countsLoading,
}: Readonly<{
  board: IBoard;
  onDealsPage: boolean;
  pipelineCounts: Record<string, number>;
  countsLoading: boolean;
}>) {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const [{ boardId, pipelineId }, setBoardSelection] =
    useMultiQueryState<TBoardSelection>(['boardId', 'pipelineId', 'stageId']);

  const isActive = onDealsPage && boardId === board._id;
  const pipelines = (board.pipelines?.filter(isDefined) || []).filter(
    (pipeline) => pipeline.status !== 'archived',
  );

  const [open, setOpen] = useState(isActive);
  const setPipelineCreateBoardId = useSetAtom(pipelineCreateBoardIdState);

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
        <div
          className={cn(
            'group/board-row w-full flex items-center justify-between rounded-lg hover:bg-accent',
            isActive && 'bg-foreground/5 hover:bg-foreground/5',
          )}
        >
          <Button
            variant="ghost"
            className={cn(
              'px-2 flex min-w-0 flex-1 justify-start rounded-lg hover:bg-transparent',
              isActive && 'text-foreground',
            )}
            onClick={handleBoardClick}
          >
            <TextOverflowTooltip
              className="font-sans font-semibold normal-case text-left flex-1 min-w-0"
              value={board.name}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:bg-transparent hover:text-foreground opacity-0 group-hover/board-row:opacity-100 group-focus-within/board-row:opacity-100 focus-visible:opacity-100"
            aria-label={t('add-pipeline')}
            onClick={() => {
              setOpen(true);
              setPipelineCreateBoardId(board._id);
            }}
          >
            <IconPlus className="size-4" />
          </Button>
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              className="shrink-0 size-6 p-0 hover:bg-transparent"
              aria-label={board.name}
            >
              <span className="flex text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none">
                <IconChevronRight className="size-3.5!" />
              </span>
            </Button>
          </Collapsible.Trigger>
        </div>
        <Collapsible.Content forceMount className="group/board-content">
          <div className="grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-out group-data-[state=closed]/board-content:invisible group-data-[state=closed]/board-content:grid-rows-[0fr] group-data-[state=closed]/board-content:opacity-0 group-data-[state=open]/board-content:grid-rows-[1fr] motion-reduce:transition-none">
            <div className="min-h-0 overflow-hidden">
              <div className="pt-1">
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
                          <DealCount
                            count={pipelineCounts[pipeline._id]}
                            loading={countsLoading}
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
              </div>
            </div>
          </div>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
}

const DealsNavigation = ({ onDealsPage }: { onDealsPage: boolean }) => {
  useBoardArchiveSubscription();
  const { boards, loading, error } = useBoards();
  const [boardId, setBoardId] = useQueryState<string | null>('boardId');
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );
  const { t } = useTranslation('sales');
  const { byPipeline, loading: countsLoading } = useBoardDealCounts({
    boards,
    pipelineId,
  });

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
    <>
      <NavigationMenuGroup
        name={t('boards')}
        actions={<BoardsNavigationActions />}
      >
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <p className="p-2 text-sm text-destructive">{error.message}</p>
        ) : !boards?.length ? (
          <p className="p-2 text-sm text-muted-foreground">
            {t('no-boards', 'No boards')}
          </p>
        ) : (
          boards.map((board) => (
            <BoardItem
              key={board._id}
              board={board}
              onDealsPage={onDealsPage}
              pipelineCounts={byPipeline}
              countsLoading={countsLoading}
            />
          ))
        )}
      </NavigationMenuGroup>
      <BoardCreateDialog onDealsPage={onDealsPage} />
      <PipelineCreateSheet />
    </>
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
