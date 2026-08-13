import { useAutomationExecutionCounts } from '@/automations/hooks/useAutomationExecutionCounts';
import {
  automationExecutionCountAtomFamily,
  automationExecutionCountsLoadingState,
} from '@/automations/states/automationExecutionCountsState';
import { RecordTableInlineCell, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

/**
 * Renders nothing — it only owns the counts request, so resolving it re-renders
 * this component instead of the table.
 */
export const AutomationExecutionCountsLoader = ({
  automationIds,
}: {
  automationIds: string[];
}) => {
  // A new array identity on every parent render would refire the query.
  const ids = useMemo(() => automationIds, [automationIds.join(',')]);

  useAutomationExecutionCounts(ids);

  return null;
};

export const AutomationExecutionCountCell = ({ id }: { id: string }) => {
  const count = useAtomValue(automationExecutionCountAtomFamily(id));
  const loading = useAtomValue(automationExecutionCountsLoadingState);

  if (count === undefined) {
    return (
      <RecordTableInlineCell className="justify-end px-3">
        {loading ? (
          <Skeleton className="h-3 w-8" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell className="justify-end px-3 tabular-nums">
      {count}
    </RecordTableInlineCell>
  );
};
