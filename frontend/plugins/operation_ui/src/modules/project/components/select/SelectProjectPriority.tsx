import { SelectPriority } from '@/operation/components/SelectPriority';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';

export const SelectProjectPriority = ({
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
    <SelectPriority
      variant={inInlineCell ? 'table' : 'detail'}
      value={value}
      onValueChange={(value) =>
        updateProject({
          variables: { _id: projectId, priority: Number(value) },
        })
      }
    />
  );
};
