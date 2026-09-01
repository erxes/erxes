import { Skeleton, TextOverflowTooltip, Tooltip } from 'erxes-ui';

import { IBranch } from '../types/Branch';
import { useBranches } from '../hooks/useBranches';

export const BranchesInline = ({
  branchIds = [],
  branches,
  placeholder,
}: {
  branchIds?: string[];
  branches?: IBranch[];
  placeholder?: string;
}) => {
  const skip = Boolean(branches) || branchIds.length === 0;

  const { branches: fetchedBranches, loading } = useBranches({
    variables: { ids: branchIds, limit: branchIds.length },
    skip,
  });

  const resolved = branches || fetchedBranches || [];

  const labels = branchIds.map(
    (branchId) => resolved.find((b) => b._id === branchId)?.title || branchId,
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
          <span>{`${labels.length} branches`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>{labels.join(', ')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
