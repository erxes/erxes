import { IconChevronRight, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  cn,
  isDefined,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useLocation } from 'react-router-dom';

import { BoardDisclosure } from '@/deals/boards/components/BoardDisclosure';
import { BoardsNavigationActions } from '@/deals/boards/components/BoardsNavigationActions';
import { useBoardDealCounts } from '@/deals/boards/hooks/useBoardDealCounts';
import { PipelineCreateSheet } from '@/deals/pipelines/components/PipelineCreateSheet';
import { pipelineCreateBoardIdState } from '@/deals/states/pipelineCreateSheetState';
import { IBoard } from '@/deals/types/boards';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBoards } from '~/modules/deals/boards/hooks/useBoards';

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

function DealCount({ count }: { count?: number }) {
  if (count === undefined) {
    return <Skeleton className="size-4 shrink-0 rounded-full" />;
  }

  return (
    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
      {count}
    </span>
  );
}

function BoardItem({
  board,
  pipelineCounts,
}: {
  board: IBoard;
  pipelineCounts: Record<string, number>;
}) {
  const { t } = useTranslation('sales');
  const [{ boardId, pipelineId }, setBoardSelection] =
    useMultiQueryState<TBoardSelection>(['boardId', 'pipelineId', 'stageId']);

  const isActive = boardId === board._id;
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
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
                setPipelineCreateBoardId(board._id);
              }}
            >
              <IconPlus className="size-4" />
            </Button>
            <span className="flex shrink-0 px-2 text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none">
              <IconChevronRight className="size-3.5!" />
            </span>
          </div>
        </Collapsible.Trigger>
        <BoardDisclosure open={open}>
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
                      <DealCount count={pipelineCounts[pipeline._id]} />
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
        </BoardDisclosure>
      </Sidebar.Group>
    </Collapsible>
  );
}

const DealsNavigation = () => {
  const { boards, loading } = useBoards();
  const [boardId, setBoardId] = useQueryState<string | null>('boardId');
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );
  const { t } = useTranslation('sales');
  const { byPipeline } = useBoardDealCounts({ boards, pipelineId });

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

    const pipelines = (currentBoard.pipelines?.filter(isDefined) || []).filter(
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
    <>
      <NavigationMenuGroup
        name={t('boards')}
        actions={<BoardsNavigationActions />}
      >
        {loading ? (
          <LoadingSkeleton />
        ) : (
          boards?.map((board) => (
            <BoardItem
              key={board._id}
              board={board}
              pipelineCounts={byPipeline}
            />
          ))
        )}
      </NavigationMenuGroup>
      <PipelineCreateSheet />
    </>
  );
};

export function SalesSubNavigation() {
  const location = useLocation();
  const isDeals = location.pathname.startsWith('/sales/deals');

  if (!isDeals) return null;

  return <DealsNavigation />;
}
