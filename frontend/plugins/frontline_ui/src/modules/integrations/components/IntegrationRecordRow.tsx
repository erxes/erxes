import { cn, RecordTable } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { ComponentProps } from 'react';
import { removingIntegrationIdsAtom } from '@/integrations/states/integrationRemoveStates';

/** Locks a row while its remove is in flight, so nothing else acts on it. */
export const IntegrationRecordRow = ({
  className,
  ...props
}: ComponentProps<typeof RecordTable.Row>) => {
  const removingIds = useAtomValue(removingIntegrationIdsAtom);
  const isRemoving = removingIds.includes(props.original?._id);

  return (
    <RecordTable.Row
      {...props}
      aria-busy={isRemoving || undefined}
      className={cn(
        isRemoving && 'pointer-events-none select-none opacity-50',
        className,
      )}
    />
  );
};
