import { Link } from 'react-router-dom';
import { useGetTask } from '@/task/hooks/useGetTask';

export const TaskDetail = ({ taskId }: { taskId: string }) => {
  const { loading, task } = useGetTask({ variables: { _id: taskId } });

  if (loading) {
    return <div>loading...</div>;
  }

  return <Link to={`operation/tasks/${task?._id}`}>{task?.name}</Link>;
};
