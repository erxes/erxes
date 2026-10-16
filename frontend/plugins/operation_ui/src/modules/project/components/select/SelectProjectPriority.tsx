import { SelectPriority } from '@/operation/components/SelectPriority';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';

export const SelectProjectPriority = ({
  projectId,
  value,
  inInlineCell = false,
  label,
}: {
  projectId: string;
  value?: number | null;
  inInlineCell?: boolean;
  label?: string;
}) => {
  const { updateProject } = useUpdateProject();

  return (
    <SelectPriority
      variant={inInlineCell ? 'table' : 'detail'}
      value={value}
      label={label}
      onValueChange={(value) =>
        updateProject({
          variables: { _id: projectId, priority: Number(value) },
        })
      }
    />
  );
};
