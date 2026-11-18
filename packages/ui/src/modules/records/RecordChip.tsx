import { IconArrowUpRight } from '@tabler/icons-react';
import { Avatar } from '../../components/avatar';
import { Skeleton } from '../../components/skeleton';
import { cn } from '../../lib/utils';
import { readImage } from '../../utils/core';
import { type RecordRef, useOpenRecord } from './openRecord';

const CHIP =
  'group/chip inline-flex h-6 max-w-full items-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium';

/**
 * A record as a chip: its avatar and name. Inside erxes, clicking it opens the record in core's
 * side panel beside the page; elsewhere it is only the name. A record that can't be read says
 * why, and still opens to show it.
 */
export const RecordChip = ({
  record,
  name,
  avatarUrl,
  loading,
  failed,
}: {
  record: RecordRef;
  name: string;
  avatarUrl: string | null | undefined;
  loading: boolean;
  failed: boolean;
}) => {
  const { open, canOpen } = useOpenRecord();

  if (loading) return <Skeleton radius="sm" className="h-5 w-20" />;

  const face = (
    <>
      <Avatar size="sm" className="size-4 flex-none">
        <Avatar.Image src={readImage(avatarUrl ?? undefined)} />
        <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
      </Avatar>
      <span className={cn('truncate', failed && 'text-destructive-text')}>{name}</span>
    </>
  );

  if (!canOpen) {
    return (
      <span title={name} className={CHIP}>
        {face}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open(record)}
      title={name}
      data-panel-inline=""
      className={cn(
        CHIP,
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {face}
      {/* It opens the record: say so on hover. */}
      <IconArrowUpRight
        className="size-3 flex-none text-muted-foreground opacity-0 transition-opacity group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
};
