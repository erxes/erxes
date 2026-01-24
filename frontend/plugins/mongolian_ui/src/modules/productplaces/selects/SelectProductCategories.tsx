import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Select, cn } from 'erxes-ui';

const PRODUCT_CATEGORIES_QUERY = gql`
  query productCategories($status: String, $searchValue: String) {
    productCategories(status: $status, searchValue: $searchValue) {
      _id
      name
    }
  }
`;

type ProductCategory = {
  _id: string;
  name: string;
};

type Props = {
  value?: string[];
  onChange: (ids: string[]) => void;
  status?: string;
  disabled?: boolean;
};

const MULTI_VALUE = '__multi__';

export default function SelectProductCategories({
  value = [],
  onChange,
  status,
  disabled,
}: Props) {
  const { data, loading } = useQuery(PRODUCT_CATEGORIES_QUERY, {
    variables: { status },
  });

  const categories: ProductCategory[] = useMemo(
    () => data?.productCategories || [],
    [data],
  );

  const selectedSet = useMemo(() => new Set(value), [value]);

  const selectedLabels = useMemo(() => {
    if (!value.length) return '';

    const map = new Map(categories.map((c) => [c._id, c.name]));
    return value.map((id) => map.get(id) || id).join(', ');
  }, [value, categories]);

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
        {/* IMPORTANT: custom display so it won't be blank white */}
        <span
          className={cn(
            'text-sm line-clamp-1',
            !selectedLabels && 'text-accent-foreground/70',
          )}
        >
          {loading
            ? 'Loading...'
            : selectedLabels || 'Choose product category'}
        </span>
      </Select.Trigger>

      <Select.Content>
        {categories.map((c) => (
          <Select.Item key={c._id} value={c._id}>
            {selectedSet.has(c._id) ? '✓ ' : ''}
            {c.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
