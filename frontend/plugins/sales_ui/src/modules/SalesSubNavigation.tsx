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
  useToast,
} from 'erxes-ui';
import { IconDotsVertical, IconLink, IconSettings } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IBoard } from '@/deals/types/boards';
import { useBoards } from '@/deals/boards/hooks/useBoards';
import { useEffect } from 'react';
import { usePipelines } from '@/deals/boards/hooks/usePipelines';

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
  const [boardId, setBoardId] = useQueryState<string | null>('boardId');

  useEffect(() => {
    const storedBoardId = localStorage.getItem('erxesCurrentBoardId');

    if (storedBoardId && !boardId) {
      setBoardId(storedBoardId);
    }
  }, [boardId]);

  const isActive = boardId === board._id;

  const handleClick = (boardId: string) => {
    localStorage.setItem('erxesCurrentBoardId', boardId);
    setBoardId(boardId);
    localStorage.removeItem('erxesCurrentPipelineId');
  };

  return (
    <Sidebar.Group className="p-0">
      <div className="w-full relative group/trigger hover:cursor-pointer">
        <div className="w-full flex items-center justify-between">
          <Sidebar.MenuButton
            isActive={isActive}
            onClick={() => handleClick(board._id)}
          >
            <div className="flex items-center gap-2">
              <TextOverflowTooltip
                className="font-sans font-semibold normal-case flex-1 min-w-0"
                value={board.name}
              />
            </div>
          </Sidebar.MenuButton>
        </div>
      </div>
    </Sidebar.Group>
  );
}

const Pipelines = () => {
  const [boardId] = useQueryState<string | null>('boardId');
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );
  const storedBoardId = localStorage.getItem('erxesCurrentBoardId');
  const selectedBoardId = storedBoardId ? storedBoardId : boardId;

  const { pipelines, loading } = usePipelines({
    variables: {
      boardId: selectedBoardId,
    },
    skip: !selectedBoardId,
  });

  useEffect(() => {
    if (!boardId || !pipelines) return;

    const storedPipelineId = localStorage.getItem('erxesCurrentPipelineId');

    if (storedPipelineId) {
      setPipelineId(storedPipelineId);
    } else {
      setPipelineId(pipelines[0]?._id || null);
    }
  }, [boardId, pipelines]);

  return (
    <Collapsible.Content className="pt-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            pipelines?.map((pipeline) => (
              <Sidebar.MenuItem key={pipeline._id}>
                <Sidebar.MenuButton
                  isActive={pipelineId === pipeline._id}
                  onClick={() => {
                    localStorage.setItem(
                      'erxesCurrentPipelineId',
                      pipeline._id,
                    );
                    setPipelineId(pipeline._id);
                  }}
                >
                  <span className="capitalize">{pipeline.name}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))
          )}
          {!loading && !pipelines?.length && (
            <Sidebar.MenuItem>
              <Sidebar.MenuButton disabled={true}>
                <span className="capitalize text-foreground">No pipelines</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          )}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  );
};

const ActionsMenu = () => {
  const navigate = useNavigate();

  const { toast } = useToast();

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/settings/deals`;

    try {
      await navigator.clipboard.writeText(link);
      toast({
        variant: 'default',
        title: 'Link copied to clipboard',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy link',
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
          onSelect={(e) => {
            navigate(`/settings/deals`);
          }}
        >
          <IconSettings className="size-4" />
          Manage board & pipelines
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={(e) => {
            handleCopyLink();
          }}
          className="cursor-pointer"
        >
          <IconLink className="size-4" />
          Copy link
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const DealsNavigation = () => {
  const { boards, loading } = useBoards();
  const [boardId, setBoardId] = useQueryState<string | null>('boardId');

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
    <>
      <NavigationMenuGroup name="Boards" actions={<ActionsMenu />}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          boards?.map((board) => <BoardItem key={board._id} board={board} />)
        )}
      </NavigationMenuGroup>
      <NavigationMenuGroup name="Pipelines" actions={<ActionsMenu />}>
        {boardId && <Pipelines />}
      </NavigationMenuGroup>
    </>
  );
};

export function SalesSubNavigation() {
  const location = useLocation();
  const isDeals = location.pathname.startsWith('/sales/deals');

  if (!isDeals) return null;

  return <DealsNavigation />;
}
