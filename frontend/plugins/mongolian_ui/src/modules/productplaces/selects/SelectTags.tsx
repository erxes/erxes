import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Select, cn } from 'erxes-ui';

const TAGS_QUERY = gql`
  query tagsQuery(
    $type: String
    $parentId: String
    $searchValue: String
    $ids: [String]
    $excludeIds: Boolean
  ) {
    tags(
      type: $type
      parentId: $parentId
      searchValue: $searchValue
      ids: $ids
      excludeIds: $excludeIds
    ) {
      list {
        _id
        name
      }
    }
  }
`;

type Tag = { _id: string; name: string };

type Props = {
  value?: string[];
  onChange: (ids: string[]) => void;
  type?: string;
  disabled?: boolean;
};

const MULTI_VALUE = '__multi__';

export default function SelectProductTags({
  value = [],
  onChange,
  type = 'core:product',
  disabled,
}: Props) {
  const { data, loading } = useQuery(TAGS_QUERY, {
    variables: { type, ids: [] },
  });

  const tags: Tag[] = useMemo(() => data?.tags?.list || [], [data]);
  const selectedSet = useMemo(() => new Set(value), [value]);

  const selectedLabels = useMemo(() => {
    if (!value.length) return '';

    const map = new Map(tags.map((t) => [t._id, t.name]));
    return value.map((id) => map.get(id) || id).join(', ');
  }, [value, tags]);

  const toggle = (id: string) => {
    if (!id) return;

    if (selectedSet.has(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <Select value={MULTI_VALUE} onValueChange={toggle} disabled={disabled}>
      <Select.Trigger className="w-full">
        <span
          className={cn(
            'text-sm line-clamp-1',
            !selectedLabels && 'text-accent-foreground/70',
          )}
        >
          {loading ? 'Loading...' : selectedLabels || 'Choose product tag'}
        </span>
      </Select.Trigger>

      <Select.Content>
        {tags.map((t) => (
          <Select.Item key={t._id} value={t._id}>
            {selectedSet.has(t._id) ? '✓ ' : ''}
            {t.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
