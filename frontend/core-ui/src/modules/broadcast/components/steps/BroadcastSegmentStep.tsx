import { IconChartPie } from '@tabler/icons-react';
import { cn, Command, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ISegment } from 'ui-modules';
import {
  CUSTOMER_SEGMENT_TYPE,
  useBroadcastSegmentSelection,
} from '../../hooks/useBroadcastSegmentSelection';
import { BroadcastTargetEmpty } from './BroadcastTargetEmpty';

// A segment's name is optional in the segments module, so a row can arrive
// with nothing to show. Naming it by its id at least leaves something to
// recognise and click rather than a blank line.
const segmentLabel = (segment: ISegment, t: (key: string) => string) =>
  segment.name?.trim() || `${t('untitled')} · ${segment._id.slice(0, 6)}`;

export const BroadcastSegmentStep = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const { segments, loading, error, isSelected, toggle } =
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
    <Command>
      <Command.List className="min-h-full">
        {segments.map((segment) => (
          <Command.Item
            key={segment._id}
            value={segment._id}
            onSelect={() => toggle(segment)}
            className={cn(
              'mb-1 flex justify-between cursor-pointer last-of-type:mb-9',
              isSelected(segment) &&
                'bg-primary/10 data-[selected=true]:bg-primary/10',
            )}
          >
            <span
              className={segment.name?.trim() ? '' : 'text-muted-foreground'}
            >
              {segmentLabel(segment, t)}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              {segment.membersCount ?? '—'}
            </span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
