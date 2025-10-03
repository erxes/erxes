import { SelectStatus } from '@/operation/components/SelectStatus';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';

export const SelectProjectStatus = ({
  projectId,
  value,
  inInlineCell = false,
}: {
  projectId: string;
  value?: number;
  inInlineCell?: boolean;
}) => {
  const { updateProject } = useUpdateProject();

  return (
    <SelectStatus
      variant={inInlineCell ? 'table' : 'detail'}
      value={value}
      onValueChange={(value) =>
        updateProject({ variables: { _id: projectId, status: value } })
      }
    />
  );
};
