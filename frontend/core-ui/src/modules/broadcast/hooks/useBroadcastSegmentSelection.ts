import { useQuery } from '@apollo/client';
import { useFormContext } from 'react-hook-form';
import { ISegment, SEGMENTS } from 'ui-modules';

export const CUSTOMER_SEGMENT_TYPE = 'core:contacts.customers';

/**
 * The customer segments a campaign can target, and toggling one in or out.
 * The audience size follows the selection, summed from each segment.
 */
export const useBroadcastSegmentSelection = ({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange: (value: string[]) => void;
}) => {
  const { setValue } = useFormContext();
  const { data, loading, error } = useQuery<{ segments?: ISegment[] }>(
    SEGMENTS,
    { variables: { contentTypes: [CUSTOMER_SEGMENT_TYPE] } },
  );

  const segments = data?.segments ?? [];

  const isSelected = (segment: ISegment) => value.includes(segment._id);

  const toggle = (segment: ISegment) => {
    const targetIds = isSelected(segment)
      ? value.filter((id) => id !== segment._id)
      : [...value, segment._id];

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

  return { segments, loading, error, isSelected, toggle };
};
