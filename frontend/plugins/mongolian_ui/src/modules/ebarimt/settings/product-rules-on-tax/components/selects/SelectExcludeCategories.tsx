import { Form, Select } from 'erxes-ui';
import { useGetExcludeCategories } from '@/ebarimt/settings/product-rules-on-tax/hooks/useExcludeCategories';
import { IExcludeCategory } from '@/ebarimt/settings/product-rules-on-tax/types/excludeCategories';

export const SelectExcludeCategories = ({
  value,
  onValueChange,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { excludeCategories, loading } = useGetExcludeCategories({
    skip: false,
    variables: {
      perPage: 20,
      page: 1,
    },
  });

  const selectedExcludeCategory = excludeCategories?.find(
    (category: IExcludeCategory) => category._id === value,
  );

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <Form.Control>
        <Select.Trigger>
          <span>
            {selectedExcludeCategory?.name || 'Select a exclude category'}
          </span>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {excludeCategories?.map((category: IExcludeCategory) => (
          <Select.Item key={category._id} value={category._id}>
            {category.name}
            {category.code ? ` (${category.code})` : ''}
          </Select.Item>
        ))}

        {!loading && excludeCategories?.length === 0 && (
          <Select.Item value="no-data" disabled>
            No categories found
          </Select.Item>
        )}
      </Select.Content>
    </Select>
  );
};
