import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { SelectTriggerVariant } from '@/operation/components/SelectOperation';
import { SelectTeam } from '@/team/components/SelectTeam';

export const SelectProjectTeam = ({
  projectId,
  variant,
  value,
}: {
  projectId: string;
  value: string | string[];
  variant: `${SelectTriggerVariant}`;
}) => {
  const { updateProject } = useUpdateProject();
  return (
    <SelectTeam
      value={value}
      onValueChange={(value) =>
        updateProject({ variables: { _id: projectId, teamIds: value } })
      }
      mode="multiple"
      variant={variant}
    />
  );
};
