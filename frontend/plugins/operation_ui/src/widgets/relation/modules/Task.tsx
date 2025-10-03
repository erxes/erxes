import { useRelations } from '../hooks/useRelations';
import { TaskDetail } from './TaskDetail';

export const Task = ({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) => {
  const { ownEntities, loading } = useRelations({
    contentId,
    contentType,
  });

  if (loading) {
    return <div>loading...</div>;
  }

  return ownEntities?.map((entity) => {
    return <TaskDetail key={entity.contentId} taskId={entity.contentId} />;
  });
};
