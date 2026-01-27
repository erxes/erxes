import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Select, cn } from 'erxes-ui';

const SEGMENTS_QUERY = gql`
  query segments($contentTypes: [String]!, $config: JSON) {
    segments(contentTypes: $contentTypes, config: $config) {
      _id
      name
      contentType
    }
  }
`;

type Segment = {
  _id: string;
  name: string;
  contentType: string;
};

type Props = {
  value?: string;
  onChange: (segmentId: string) => void;

  contentTypes: string[];
  config?: any;

  disabled?: boolean;
};

const CLEAR_VALUE = '__clear__';

export default function SelectSegments({
  value,
  onChange,
  contentTypes,
  config,
  disabled,
}: Props) {
  const { data, loading } = useQuery(SEGMENTS_QUERY, {
    variables: { contentTypes, config },
    skip: !contentTypes?.length,
  });

  const segments: Segment[] = useMemo(() => data?.segments || [], [data]);

  const selectedLabel = useMemo(() => {
    if (!value) return '';
    return segments.find((s) => s._id === value)?.name || value;
  }, [value, segments]);

  const placeholder = !contentTypes?.length
    ? 'No contentTypes'
    : loading
      ? 'Loading...'
      : 'Choose segment';

  return (
  <Select
    value={value || ''} 
    onValueChange={(v) => onChange(v === CLEAR_VALUE ? '' : v)}
    disabled={disabled || loading || !contentTypes?.length}
  >
    <Select.Trigger className="w-full">
      <Select.Value
        placeholder={
          !contentTypes?.length
            ? 'No contentTypes'
            : loading
              ? 'Loading...'
              : 'Choose segment'
        }
      />
    </Select.Trigger>

    <Select.Content>
      <Select.Item value={CLEAR_VALUE}>Clear</Select.Item>

      {segments.map((s) => (
        <Select.Item key={s._id} value={s._id}>
          {s.name}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);

}
