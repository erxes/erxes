import { Form, Select } from 'erxes-ui';
import { useGetProductCategories } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProductCategories';
import { IProductCategories } from '@/ebarimt/settings/product-rules-on-tax/types/productCategories';

export const SelectProductCategories = ({
  value,
  onValueChange,
  disabled,
}: {
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
}) => {
  const { productCategories, loading } = useGetProductCategories({
    skip: false,
    variables: {
      perPage: 20,
      page: 1,
    },
  });

  const selectedProductCategories = value
    ? productCategories?.find(
        (productCategories: IProductCategories) =>
          productCategories._id === value,
      )
    : undefined;

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <Form.Control>
        <Select.Trigger>
          <span>
            {selectedProductCategories?.name || 'Select a main product'}
          </span>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {productCategories?.map((productCategories: IProductCategories) => (
          <Select.Item
            key={productCategories._id}
            value={productCategories._id}
          >
            {productCategories.name}{' '}
            {productCategories.code ? `(${productCategories.code})` : ''}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
