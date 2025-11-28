import { Form, Select } from 'erxes-ui';
import { IExcludeProduct } from '@/ebarimt/settings/product-rules-on-tax/types/excludeProducts';
import { useGetExcludeProducts } from '@/ebarimt/settings/product-rules-on-tax/hooks/useExcludeProducts';

export const SelectExcludeProducts = ({
  value,
  onValueChange,
  disabled,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { excludeProducts, loading } = useGetExcludeProducts({
    skip: false,
    variables: {
      perPage: 20,
      page: 1,
    },
  });

  const selectedExcludeProducts = excludeProducts?.find(
    (excludeProducts: IExcludeProduct) => excludeProducts._id === value,
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
            {selectedExcludeProducts?.name || 'Select a exclude product'}
          </span>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {excludeProducts?.map((excludeProducts: IExcludeProduct) => (
          <Select.Item key={excludeProducts._id} value={excludeProducts._id}>
            {excludeProducts.name}{' '}
            {excludeProducts.code ? `(${excludeProducts.code})` : ''}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
