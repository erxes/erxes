import { useQuery } from '@apollo/client';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('broadcasts');
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

  // A segment's name is optional in the segments module, so a row can arrive
  // with nothing to show. Naming it by its id at least leaves something to
  // recognise and click rather than a blank line.
  const labelOf = (segment: ISegment) =>
    segment.name?.trim() || `${t('untitled')} · ${segment._id.slice(0, 6)}`;

  const isUnnamed = (segment: ISegment) => !segment.name?.trim();

  return { segments, loading, error, isSelected, toggle, labelOf, isUnnamed };
};
