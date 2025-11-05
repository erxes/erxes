import { Link } from 'react-router-dom';
import { useGetTask } from '@/task/hooks/useGetTask';
import { Spinner } from 'erxes-ui';

export const TaskDetail = ({ taskId }: { taskId: string }) => {
  const { loading, task } = useGetTask({ variables: { _id: taskId } });

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  return <Link to={`operation/tasks/${task?._id}`}>{task?.name}</Link>;
};
