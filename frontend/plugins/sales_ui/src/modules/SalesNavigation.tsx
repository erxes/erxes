'use client';

import {
  Button,
  Collapsible,
  NavigationMenuGroup,
  NavigationMenuLinkItem,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import {
  Icon,
  IconCards,
  IconCaretRightFilled,
  IconLayoutCards,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IBoard } from '@/deals/types/boards';
import { IPipeline } from '@/deals/types/pipelines';
import { useBoards } from '@/deals/boards/hooks/useBoards';
import { useLastBoard } from './deals/boards/hooks/useLastBoard';
import { usePipelines } from '@/deals/boards/hooks/usePipelines';

const groups = [
  {
    name: 'Boards',
    icon: IconLayoutCards,
  },
  {
    name: 'Pipelines',
    icon: IconCards,
  },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
  );
}

function Boards({
  boardId,
  lastBoardLoading,
  handleClick,
}: {
  boardId: string;
  lastBoardLoading: boolean;
  handleClick: (boardId: string, pipelineId?: string) => void;
}) {
  const { boards, loading } = useBoards();

  if (loading || lastBoardLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Sidebar.Menu>
      {(boards || []).map((board: IBoard) => (
        <NavigationMenuLinkItem
          key={board._id}
          name={board.name}
          pathPrefix="deals"
          className="pl-6 font-medium"
          path={
            board.pipelines && board.pipelines.length > 0
              ? `?boardId=${board._id}&pipelineId=${board.pipelines[0]._id}`
              : `?boardId=${board._id}`
          }
          isActive={board._id === boardId}
          onClick={() => handleClick(board._id, board?.pipelines?.[0]?._id)}
        />
      ))}
    </Sidebar.Menu>
  );
}

function Pipelines({
  boardId,
  pipelineId,
  handleClick,
}: {
  boardId: string;
  pipelineId: string;
  handleClick: (boardId: string, pipelineId?: string) => void;
}) {
  const { pipelines, loading } = usePipelines({
    variables: {
      boardId,
    },
    skip: !boardId,
  });

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Sidebar.Menu>
      {(pipelines || []).map((pipeline: IPipeline) => (
        <NavigationMenuLinkItem
          key={pipeline._id}
          name={pipeline.name}
          pathPrefix="deals"
          className="pl-6 font-medium"
          path={`?boardId=${boardId}&pipelineId=${pipeline._id}`}
          isActive={pipeline._id === pipelineId}
          onClick={() => handleClick(boardId, pipeline._id)}
        />
      ))}
    </Sidebar.Menu>
  );
}

function SalesItem({ name, Icon }: { name: string; Icon: Icon }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const storedBoardId = localStorage.getItem('erxesCurrentBoardId');
  const storedPipelineId = localStorage.getItem('erxesCurrentPipelineId');

  const [selectedBoardId, setSelectedBoardId] =
    useQueryState<string>('boardId');

  const [selectedPipelineId, setSelectedPipelineId] =
    useQueryState<string>('pipelineId');

  const handleClick = (boardId: string, pipelineId?: string) => {
    localStorage.setItem('erxesCurrentBoardId', boardId);
    if (pipelineId) {
      localStorage.setItem('erxesCurrentPipelineId', pipelineId);
    } else {
      localStorage.removeItem('erxesCurrentPipelineId');
    }
  };

  const { lastBoard, loading: lastBoardLoading } = useLastBoard();

  useEffect(() => {
    if (location.pathname.startsWith('/deals')) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.startsWith('/deals')) return;

    if (!selectedBoardId && storedBoardId) {
      setSelectedBoardId(storedBoardId);
    }

    if (!selectedPipelineId && storedPipelineId) {
      setSelectedPipelineId(storedPipelineId);
    }

    if (
      !selectedBoardId &&
      !storedBoardId &&
      lastBoard &&
      lastBoard.pipelines &&
      lastBoard.pipelines.length > 0
    ) {
      setSelectedBoardId(lastBoard._id);
      setSelectedPipelineId(lastBoard.pipelines[0]._id);
    }

    if (!selectedBoardId && !storedBoardId && lastBoard) {
      const baseUrl = `/deals/?boardId=${lastBoard._id}`;

      const url =
        lastBoard.pipelines && lastBoard.pipelines.length > 0
          ? `${baseUrl}&pipelineId=${lastBoard.pipelines[0]._id}`
          : baseUrl;

      navigate(url);
    }

    if (!selectedBoardId && storedBoardId && storedPipelineId) {
      navigate(
        `/deals/?boardId=${storedBoardId}&pipelineId=${storedPipelineId}`,
      );
    }
  }, [
    selectedBoardId,
    lastBoard,
    setSelectedBoardId,
    setSelectedPipelineId,
    navigate,
    location.pathname,
    storedBoardId,
    storedPipelineId,
    selectedPipelineId,
  ]);

  return (
    <Collapsible
      className="group/collapsible"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Sidebar.Group className="p-0">
        <div className="w-full relative group/trigger hover:cursor-pointer">
          <Collapsible.Trigger asChild>
            <div className="w-full flex items-center justify-between">
              <Button
                variant="ghost"
                className="px-2 flex min-w-0 justify-start"
              >
                <Icon className="text-accent-foreground flex-shrink-0" />
                <TextOverflowTooltip
                  className="font-sans font-semibold normal-case flex-1 min-w-0"
                  value={name}
                />
                <span className="ml-auto flex-shrink-0">
                  <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-90 text-accent-foreground" />
                </span>
              </Button>
              <div className="size-5 min-w-5 mr-2"></div>
            </div>
          </Collapsible.Trigger>
          {/* <TeamActionsMenu team={team} /> */}
        </div>
        <Collapsible.Content className="pt-1">
          <Sidebar.GroupContent>
            {name === 'Boards' && (
              <Boards
                boardId={selectedBoardId || ''}
                lastBoardLoading={lastBoardLoading}
                handleClick={handleClick}
              />
            )}
            {name === 'Pipelines' && (
              <Pipelines
                boardId={selectedBoardId || ''}
                pipelineId={selectedPipelineId || ''}
                handleClick={handleClick}
              />
            )}
          </Sidebar.GroupContent>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
}

export const SalesNavigation = () => {
  return (
    <NavigationMenuGroup name="Sales Pipeline">
      {groups.map((group) => (
        <SalesItem key={group.name} name={group.name} Icon={group.icon} />
      ))}
    </NavigationMenuGroup>
  );
};
