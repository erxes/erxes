import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Select, cn } from 'erxes-ui';

const PRODUCTS_QUERY = gql`
  query products($ids: [String], $excludeIds: Boolean, $searchValue: String) {
    products(ids: $ids, excludeIds: $excludeIds, searchValue: $searchValue) {
      _id
      name
    }
  }
`;

type Product = { _id: string; name: string };

type Props = {
  value?: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

const MULTI_VALUE = '__multi__';

export default function SelectProducts({
  value = [],
  onChange,
  disabled,
}: Props) {
  const { data, loading } = useQuery(PRODUCTS_QUERY, {
    variables: { ids: [] },
  });

  const products: Product[] = useMemo(() => data?.products || [], [data]);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const selectedLabel = useMemo(() => {
    if (!value.length) return '';
    const names = value
      .map((id) => products.find((p) => p._id === id)?.name || id)
      .slice(0, 2);

    return value.length > 2 ? `${names.join(', ')} +${value.length - 2}` : names.join(', ');
  }, [value, products]);

  const toggle = (id: string) => {
    if (!id || id === MULTI_VALUE) return;

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
            !selectedLabel && 'text-accent-foreground/70',
          )}
        >
          {selectedLabel || (loading ? 'Loading...' : 'Choose products to exclude')}
        </span>
      </Select.Trigger>

      <Select.Content>
        {products.map((p) => (
          <Select.Item key={p._id} value={p._id}>
            {selectedSet.has(p._id) ? '✓ ' : ''}
            {p.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
