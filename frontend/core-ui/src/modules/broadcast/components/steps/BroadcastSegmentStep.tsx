import { useQuery } from '@apollo/client';
import { Combobox, Command, Spinner } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { ISegment, SEGMENTS } from 'ui-modules';

const CUSTOMER_TYPE = 'core:contacts.customers';

// A segment's name is optional in the segments module, so a row can arrive
// with nothing to show. Naming it by its id at least leaves something to
// recognise and click rather than a blank line.
const segmentLabel = (segment: ISegment) =>
  segment.name?.trim() || `Untitled segment · ${segment._id.slice(0, 6)}`;

export const BroadcastSegmentStep = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const { setValue } = useFormContext();

  const { data, loading } = useQuery(SEGMENTS, {
    variables: { contentTypes: [CUSTOMER_TYPE] },
  });

  const segments: ISegment[] = data?.segments || [];

  if (loading) {
    return <Spinner />;
  }

  const toggle = (segment: ISegment) => {
    const selected = value?.includes(segment._id);

    const targetIds = selected
      ? (value || []).filter((id) => id !== segment._id)
      : [...(value || []), segment._id];

    onChange(targetIds);

    setValue(
      'targetCount',
      targetIds.reduce(
        (sum, id) =>
          sum + (segments.find((s) => s._id === id)?.membersCount || 0),
        0,
      ),
    );
  };

  return (
    <Command>
      <Command.List className="min-h-full">
        <Combobox.Empty loading={false}>
          No segment has been built for customers yet.
        </Combobox.Empty>
        {segments.map((segment) => (
          <Command.Item
            key={segment._id}
            value={segment._id}
            onSelect={() => toggle(segment)}
            className={`mb-1 flex justify-between cursor-pointer last-of-type:mb-9 ${
              value?.includes(segment._id)
                ? 'bg-primary/10 data-[selected=true]:bg-primary/10'
                : ''
            }`}
          >
            <span
              className={segment.name?.trim() ? '' : 'text-muted-foreground'}
            >
              {segmentLabel(segment)}
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
