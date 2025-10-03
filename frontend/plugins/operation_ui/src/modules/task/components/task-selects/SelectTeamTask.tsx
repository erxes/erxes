import { SelectTriggerVariant } from '@/operation/components/SelectOperation';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { SelectTeam } from '@/team/components/SelectTeam';

export const SelectTeamTask = ({
  variant,
  taskId,
  value,
}: {
  variant: `${SelectTriggerVariant}`;
  taskId: string;
  value: string | string[];
}) => {
  const { updateTask } = useUpdateTask();

  return (
    <SelectTeam
      value={value}
      onValueChange={(value) =>
        updateTask({ variables: { _id: taskId, teamId: value } })
      }
      mode="single"
      variant={variant}
    />
  );
};
