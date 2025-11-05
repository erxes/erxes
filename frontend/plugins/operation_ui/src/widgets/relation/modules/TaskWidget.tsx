import { useGetTask } from '@/task/hooks/useGetTask';
import { Spinner } from 'erxes-ui';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { TaskWidgetCard } from './TaskWidgetCard';
import { TriageWidgetCard } from './TriageWidgetCard';

export const TaskWidget = ({ taskId }: { taskId: string }) => {
  const { loading, task } = useGetTask({ variables: { _id: taskId } });

  const { loading: loadingTriage, triage } = useGetTriage({
    variables: { _id: taskId },
    skip: !!task?._id || loading,
  });

  if (loading || loadingTriage) {
    return <Spinner containerClassName="py-20" />;
  }

  if (task) {
    return <TaskWidgetCard task={task} />;
  }

  if (triage) {
    return <TriageWidgetCard triage={triage} />;
  }

  return <div>No task or triage found</div>;
};
