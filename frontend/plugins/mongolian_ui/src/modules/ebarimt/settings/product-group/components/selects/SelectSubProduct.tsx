import { Form, Select } from 'erxes-ui';
import { useGetSubProduct } from '@/ebarimt/settings/product-group/hooks/useSubProduct';
import { ISubProduct } from '@/ebarimt/settings/product-group/types/subProduct';

export const SelectSubProduct = ({
  value,
  onValueChange,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { subProducts, loading } = useGetSubProduct({
    skip: false,
    variables: {
      parentId: value,
    },
  });

  const selectedSubProduct = subProducts?.find(
    (subProduct: ISubProduct) => subProduct._id === value,
  );

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <Form.Control>
        <Select.Trigger>
          <span>{selectedSubProduct?.name || 'Select a sub product'}</span>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {subProducts?.map((subProduct: ISubProduct) => (
          <Select.Item key={subProduct._id} value={subProduct._id}>
            {subProduct.name} {subProduct.code ? `(${subProduct.code})` : ''}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
