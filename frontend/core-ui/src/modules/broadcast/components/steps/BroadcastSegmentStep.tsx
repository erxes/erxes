import { IconChartPie } from '@tabler/icons-react';
import { cn, Command, Spinner } from 'erxes-ui';
import {
  CUSTOMER_SEGMENT_TYPE,
  useBroadcastSegmentSelection,
} from '../../hooks/useBroadcastSegmentSelection';
import { BroadcastTargetEmpty } from './BroadcastTargetEmpty';

export const BroadcastSegmentStep = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const { segments, loading, error, isSelected, toggle, labelOf, isUnnamed } =
    useBroadcastSegmentSelection({ value, onChange });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  if (!segments.length) {
    return (
      <BroadcastTargetEmpty
        icon={IconChartPie}
        titleKey="target.no-segments"
        descriptionKey="target.no-segments-body"
        actionKey="target.create-segment"
        to={`/segments?contentType=${CUSTOMER_SEGMENT_TYPE}`}
      />
    );
  }

  return (
    <Command className="h-auto min-h-0 min-w-0 flex-1 border">
      <Command.List className="m-0 min-h-0 max-h-none flex-1 overflow-x-hidden overflow-y-auto p-1">
        {segments.map((segment) => (
          <Command.Item
            key={segment._id}
            value={segment._id}
            onSelect={() => toggle(segment)}
            className={cn(
              'mb-1 min-w-0 justify-between cursor-pointer last-of-type:mb-0',
              isSelected(segment) &&
                'bg-primary/10 data-[selected=true]:bg-primary/10',
            )}
          >
            <span
              className={cn(
                'min-w-0 flex-1 truncate',
                isUnnamed(segment) && 'text-muted-foreground',
              )}
              title={labelOf(segment)}
            >
              {labelOf(segment)}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {segment.membersCount ?? '—'}
            </span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
