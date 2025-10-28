import { useGetTask } from '@/task/hooks/useGetTask';
import { Spinner } from 'erxes-ui';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { TaskWidgets } from './TaskWidgets';
import { TriageWidgets } from './TriageWidgets';

export const TaskDetail = ({ taskId }: { taskId: string }) => {
  const { loading, task } = useGetTask({ variables: { _id: taskId } });

  const { loading: loadingTriage, triage } = useGetTriage({
    variables: { _id: taskId },
    skip: !!task?._id || loading,
  });

  if (loading || loadingTriage) {
    return <Spinner containerClassName="py-20" />;
  }

  if (task) {
    return <TaskWidgets task={task} />;
  }

  if (triage) {
    return <TriageWidgets triage={triage} />;
  }

  return <div>No task or triage found</div>;
};
