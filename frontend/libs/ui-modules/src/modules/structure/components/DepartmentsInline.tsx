import { Skeleton, TextOverflowTooltip, Tooltip } from 'erxes-ui';

import { IDepartment } from '../types/Department';
import { useDepartments } from '../hooks/useDepartments';

export const DepartmentsInline = ({
  departmentIds = [],
  departments,
  placeholder,
}: {
  departmentIds?: string[];
  departments?: IDepartment[];
  placeholder?: string;
}) => {
  const skip = !!departments || departmentIds.length === 0;

  const { departments: fetchedDepartments, loading } = useDepartments({
    variables: { ids: departmentIds, limit: departmentIds.length },
    skip,
  });

  const resolved = departments || fetchedDepartments || [];

  const labels = departmentIds.map(
    (departmentId) =>
      resolved.find((d) => d._id === departmentId)?.title || departmentId,
  );

  if (loading && !skip) {
    return <Skeleton className="w-16 h-4" />;
  }

  if (labels.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (labels.length < 3) {
    return <TextOverflowTooltip value={labels.join(', ')} />;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${labels.length} departments`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>{labels.join(', ')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
