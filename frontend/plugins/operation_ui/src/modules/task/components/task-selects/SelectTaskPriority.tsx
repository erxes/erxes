import { SelectTriggerVariant } from '@/operation/components/SelectOperation';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';

export const SelectTaskPriority = ({
  taskId,
  value,
  variant,
}: {
  taskId: string;
  value?: number;
  variant: `${SelectTriggerVariant}`;
}) => {
  const { updateTask } = useUpdateTask();

  return (
    <SelectPriority
      variant={variant}
      value={value}
      onValueChange={(value) => {
        updateTask({
          variables: { _id: taskId, priority: Number(value) },
        });
      }}
    />
  );
};
