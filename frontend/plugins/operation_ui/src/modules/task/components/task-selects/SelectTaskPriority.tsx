import { SelectTriggerVariant } from '@/operation/components/SelectOperation';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';

export const SelectTaskPriority = ({
  taskId,
  value,
  variant,
  label,
}: {
  taskId: string;
  value?: number | null;
  variant: `${SelectTriggerVariant}`;
  label?: string;
}) => {
  const { updateTask } = useUpdateTask();

  return (
    <SelectPriority
      variant={variant}
      label={label}
      value={value}
      onValueChange={(value) => {
        updateTask({
          variables: { _id: taskId, priority: Number(value) },
        });
      }}
    />
  );
};
