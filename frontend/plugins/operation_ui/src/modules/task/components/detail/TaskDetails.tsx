import { TaskFields } from '@/task/components/detail/TaskFields';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { TriageFields } from '@/triage/components/TriageFields';

export const TaskDetails = ({
  taskId,
  checkTriage,
}: {
  taskId: string;
  checkTriage?: boolean;
}) => {
  const { task, loading: loadingTask } = useGetTask({
    variables: { _id: taskId },
  });

  const { triage } = useGetTriage({
    variables: { _id: taskId },
    skip: !checkTriage || loadingTask,
  });

  if (!task && !triage) {
    return null;
  }

  return (
    <div className="h-full w-full flex overflow-auto">
      <div className="w-full xl:max-w-3xl mx-auto py-12 px-6">
        {task && <TaskFields task={task} />}
        {triage && <TriageFields triage={triage} />}
      </div>
    </div>
  );
};
