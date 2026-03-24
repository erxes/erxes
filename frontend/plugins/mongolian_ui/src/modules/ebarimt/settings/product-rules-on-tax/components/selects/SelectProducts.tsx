import { Form, Select } from 'erxes-ui';
import { IProduct } from '@/ebarimt/settings/product-rules-on-tax/types/products';
import { useGetProducts } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProducts';

export const SelectProducts = ({
  value,
  onValueChange,
  disabled,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { products, loading } = useGetProducts({
    skip: false,
    variables: {
      perPage: 20,
      page: 1,
    },
  });

  const selectedProduct = products?.find(
    (products: IProduct) => products._id === value,
  );

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <Form.Control>
        <Select.Trigger>
          <span>{selectedProduct?.name || 'Select a product'}</span>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {products?.map((products: IProduct) => (
          <Select.Item key={products._id} value={products._id}>
            {products.name}
            {products.code ? `(${products.code})` : ''}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
