import { Accordion, Sidebar } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useBoardDetail } from '@/deals/boards/hooks/useBoards';
import { PipelineListLoading } from '@/deals/components/loading/PipelineListLoading';

export const PipelineList = ({
  boardId,
  pipelineId,
}: {
  boardId: string;
  pipelineId: string;
}) => {
  const { t } = useTranslation('sales');
  const { boardDetail, loading } = useBoardDetail({
    variables: {
      _id: boardId,
    },
  });

  if (loading) {
    return <PipelineListLoading />;
  }

  const pipelines = boardDetail?.pipelines || [];

  return (
    <>
      <Accordion.Trigger className="text-gray-400 text-sm">
        {t('pipelines')} ({pipelines?.length || 0})
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
                  className="h-auto!"
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
