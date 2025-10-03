import { Accordion, Sidebar } from 'erxes-ui';

import { IPipeline } from '@/deals/types/pipelines';
import { Link } from 'react-router-dom';
import { PipelineListLoading } from '@/deals/components/loading/PipelineListLoading';
import { useBoardDetail } from '@/deals/boards/hooks/useBoards';

export const PipelineList = ({
  boardId,
  pipelineId,
}: {
  boardId: string;
  pipelineId: string;
}) => {
  const { boardDetail, loading } = useBoardDetail({
    variables: {
      _id: boardId,
    },
  });

  if (loading) {
    return <PipelineListLoading />;
  }

  const pipelines = boardDetail?.pipelines || ([] as IPipeline[]);

  return (
    <>
      <Accordion.Trigger className="text-gray-400 text-sm">
        Pipelines ({pipelines?.length || 0})
      </Accordion.Trigger>
      <Accordion.Content className="content">
        <Sidebar.Menu className="px-2">
          {pipelines?.map((pipeline) => (
            <Link
              key={pipeline._id}
              to={`?boardId=${boardId}&pipelineId=${pipeline._id}`}
            >
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  className="!h-auto"
                  isActive={pipeline._id === pipelineId}
                >
                  <div className="flex items-center">{pipeline.name}</div>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Link>
          ))}
        </Sidebar.Menu>
      </Accordion.Content>
    </>
  );
};
