import { Accordion, Sidebar, useQueryState } from 'erxes-ui';
import { Link, useNavigate } from 'react-router-dom';

import { LeftSidebarLoading } from '@/deals/components/loading/LeftSidebarLoading';
import { PipelineList } from '@/deals/pipelines/components/PipelineList';
import { useBoards } from '@/deals/boards/hooks/useBoards';
import { useEffect } from 'react';
import { useLastBoard } from '@/deals/boards/hooks/useLastBoard';

export const SalesLeftSidebar = () => {
  const navigate = useNavigate();

  const [selectedBoardId, setSelectedBoardId] =
    useQueryState<string>('boardId');

  const [selectedPipelineId, setSelectedPipelineId] =
    useQueryState<string>('pipelineId');

  const { lastBoard, loading: lastBoardLoading } = useLastBoard();
  const { boards, loading } = useBoards();

  useEffect(() => {
    if (
      !selectedBoardId &&
      lastBoard &&
      lastBoard.pipelines &&
      lastBoard.pipelines.length > 0
    ) {
      setSelectedBoardId(lastBoard._id);
      setSelectedPipelineId(lastBoard.pipelines[0]._id);
    }

    if (!selectedBoardId && lastBoard) {
      const baseUrl = `?boardId=${lastBoard._id}`;

      const url =
        lastBoard.pipelines && lastBoard.pipelines.length > 0
          ? `${baseUrl}&pipelineId=${lastBoard.pipelines[0]._id}`
          : baseUrl;

      navigate(url);
    }
  }, [
    selectedBoardId,
    lastBoard,
    setSelectedBoardId,
    setSelectedPipelineId,
    navigate,
  ]);

  if (loading || lastBoardLoading) {
    return <LeftSidebarLoading />;
  }

  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={['boards', 'pipelines']}
          >
            <Accordion.Item value="boards">
              <Accordion.Trigger className="text-gray-400 text-sm">
                Boards ({boards?.length || 0})
              </Accordion.Trigger>
              <Accordion.Content className="content">
                <Sidebar.Menu className="px-2">
                  {boards?.map((board) => (
                    <Link
                      key={board._id}
                      to={
                        board.pipelines && board.pipelines.length > 0
                          ? `?boardId=${board._id}&pipelineId=${board.pipelines[0]._id}`
                          : `?boardId=${board._id}`
                      }
                    >
                      <Sidebar.MenuItem>
                        <Sidebar.MenuButton
                          isActive={board._id === selectedBoardId}
                        >
                          <div className="flex items-center">{board.name}</div>
                        </Sidebar.MenuButton>
                      </Sidebar.MenuItem>
                    </Link>
                  ))}
                </Sidebar.Menu>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="pipelines">
              <PipelineList
                boardId={selectedBoardId || ''}
                pipelineId={selectedPipelineId || ''}
              />
            </Accordion.Item>
          </Accordion>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
