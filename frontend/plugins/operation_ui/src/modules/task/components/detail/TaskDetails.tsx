import { TaskFields } from '@/task/components/detail/TaskFields';
import { useGetTask } from '@/task/hooks/useGetTask';

export const TaskDetails = ({ taskId }: { taskId: string }) => {
  const { task } = useGetTask({
    variables: { _id: taskId },
  });

  if (!task) {
    return null;
  }

  return (
    <div className="h-full w-full flex overflow-auto">
      <div className="w-full xl:max-w-3xl mx-auto py-12 px-6">
        <TaskFields task={task} />
      </div>
    </div>
  );
};
