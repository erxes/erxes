/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  DropdownMenu,
  HoverCollapsible,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
  useToast,
} from 'erxes-ui';
import {
  IconCaretRightFilled,
  IconDotsVertical,
  IconLink,
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
  const { toast } = useToast();

  const { t } = useTranslation('sales');

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/settings/deals`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ variant: 'default', title: t('link-copied-to-clipboard') });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: t('failed-to-copy-link'),
        description: e instanceof Error ? e.message : 'Unknown error',
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
          onClick={(e) => e.stopPropagation()}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="right" align="start" className="w-60 min-w-0">
        <DropdownMenu.Item
          className="cursor-pointer"
          onSelect={() => navigate(`/settings/deals`)}
        >
          <IconSettings className="size-4" />
          {t('manage-board-pipelines')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="cursor-pointer"
          onSelect={() => handleCopyLink()}
        >
          <IconLink className="size-4" />
          {t('copy-link')}
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
    navigate(`/sales/deals?boardId=${boardId}&pipelineId=${pipeline._id}`);
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
  // Mirror the collapsible's open state so pipelines are only fetched once the
  // board has been expanded (on hover). Start expanded for the active board.
  const [open, setOpen] = useState(boardId === board._id);

  const { pipelines, loading: pipelinesLoading } = usePipelines({
    variables: { boardId: board._id },
    skip: !open,
  });

  return (
    <HoverCollapsible
      className="group/collapsible"
      defaultOpen={boardId === board._id}
      onOpenChange={setOpen}
    >
      <Sidebar.Group className="p-0">
        <div className="w-full relative group/trigger hover:cursor-pointer">
          <HoverCollapsible.Trigger asChild>
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
          </HoverCollapsible.Trigger>
          <BoardActionsMenu board={board} />
        </div>
        <HoverCollapsible.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up pt-1">
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
        </HoverCollapsible.Content>
      </Sidebar.Group>
    </HoverCollapsible>
  );
}

const DealsNavigation = () => {
  const { boards, loading } = useBoards();
  const [boardId, setBoardId] = useQueryState<string | null>('boardId');
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

  return (
    <NavigationMenuGroup name={t('boards')}>
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
