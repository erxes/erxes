/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Collapsible,
  DropdownMenu,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import {
  IconCaretRightFilled,
  IconDotsVertical,
  IconSettings,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { IBoard } from '@/deals/types/boards';
import { IPipeline } from '@/deals/types/pipelines';
import { useBoards } from '~/modules/deals/boards/hooks/useBoards';
import { usePipelines } from '@/deals/boards/hooks/usePipelines';
import { useTranslation } from 'react-i18next';

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
  );
}

const BoardActionsMenu = ({ board }: { board: IBoard }) => {
  const navigate = useNavigate();

  const { t } = useTranslation('sales');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 -translate-y-1/2 right-1 text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="right" align="start" className="w-60 min-w-0">
        <DropdownMenu.Item
          className="cursor-pointer"
          onSelect={() =>
            navigate(`/settings/sales/deals?activeBoardId=${board._id}`)
          }
        >
          <IconSettings className="size-4" />
          {t('manage-board-pipelines')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

function PipelineItem({
  boardId,
  pipeline,
}: {
  boardId: string;
  pipeline: IPipeline;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isActive = searchParams.get('pipelineId') === pipeline._id;

  const handleClick = () => {
    localStorage.setItem('erxesCurrentBoardId', boardId);
    localStorage.setItem('erxesCurrentPipelineId', pipeline._id);
    // Preserve any existing query params (filters/search) and only update the
    // board/pipeline selection.
    const params = new URLSearchParams(searchParams);
    params.set('boardId', boardId);
    params.set('pipelineId', pipeline._id);
    navigate(`/sales/deals?${params.toString()}`);
  };

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        isActive={isActive}
        className="pl-6 font-medium"
        onClick={handleClick}
      >
        <span className="capitalize">{pipeline.name}</span>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
}

function BoardItem({ board }: { board: IBoard }) {
  const [boardId] = useQueryState<string | null>('boardId');
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );

  const isBoardActive = boardId === board._id;

  // Fetch pipelines eagerly so they are ready before the board is expanded —
  // expanding then shows them instantly (like the POS navigation), with no
  // load delay. Clicking a board just toggles the dropdown; it does not change
  // the URL, which is only updated when a pipeline is selected.
  const { pipelines, loading: pipelinesLoading } = usePipelines({
    variables: { boardId: board._id },
  });

  useEffect(() => {
    if (!isBoardActive || pipelineId || pipelinesLoading || !pipelines) {
      return;
    }

    const storedPipelineId = localStorage.getItem('erxesCurrentPipelineId');
    const storedPipelineBelongsToBoard = pipelines.some(
      (pipeline) => pipeline._id === storedPipelineId,
    );

    if (storedPipelineId && storedPipelineBelongsToBoard) {
      setPipelineId(storedPipelineId);
      return;
    }

    if (pipelines[0]?._id) {
      setPipelineId(pipelines[0]._id);
    }
  }, [isBoardActive, pipelineId, pipelinesLoading, pipelines]);

  const [open, setOpen] = useState(isBoardActive);

  useEffect(() => {
    if (isBoardActive) setOpen(true);
  }, [isBoardActive]);

  return (
    <Collapsible
      className="group/collapsible"
      open={open}
      onOpenChange={setOpen}
    >
      <Sidebar.Group className="p-0">
        <div className="w-full relative group/trigger hover:cursor-pointer">
          <Collapsible.Trigger asChild>
            <div className="w-full flex items-center justify-between">
              <Button
                variant="ghost"
                className="px-2 flex min-w-0 justify-start"
              >
                <TextOverflowTooltip
                  className="font-sans font-semibold normal-case flex-1 min-w-0"
                  value={board.name}
                />
                <span className="ml-auto">
                  <IconCaretRightFilled className="size-3 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 text-accent-foreground" />
                </span>
              </Button>
              <div className="size-5 min-w-5 mr-2"></div>
            </div>
          </Collapsible.Trigger>
          <BoardActionsMenu board={board} />
        </div>
        <Collapsible.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up pt-1">
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {pipelinesLoading ? (
                <LoadingSkeleton />
              ) : (
                pipelines?.map((pipeline) => (
                  <PipelineItem
                    key={pipeline._id}
                    boardId={board._id}
                    pipeline={pipeline}
                  />
                ))
              )}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
}

const DealsNavigation = () => {
  const { boards, loading } = useBoards();
  const [boardId, setBoardId] = useQueryState<string | null>('boardId');
  const { t } = useTranslation('sales');

  useEffect(() => {
    if (!boards || boards.length === 0 || boardId) return;

    const storedBoardId = localStorage.getItem('erxesCurrentBoardId');
    const storedBoardExists = boards.some(
      (board) => board._id === storedBoardId,
    );

    if (storedBoardId && storedBoardExists) {
      setBoardId(storedBoardId);
      return;
    }

    if (boards[0]?._id) {
      setBoardId(boards[0]._id);
    }
  }, [boards, boardId]);

  return (
    <NavigationMenuGroup name={t('boards')}>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div>
          {boards?.map((board) => (
            <BoardItem key={board._id} board={board} />
          ))}
        </div>
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
