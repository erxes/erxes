import { Form, Select } from 'erxes-ui';

import { IMainProduct } from '@/ebarimt/settings/product-group/types/mainProduct';
import { useGetMainProduct } from '@/ebarimt/settings/product-group/hooks/useMainProduct';

export const SelectMainProduct = ({
  value,
  onValueChange,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { mainProduct, loading } = useGetMainProduct({
    skip: false,
    variables: {
      perPage: 20,
      page: 1,
    },
  });

  const selectedMainProduct = mainProduct?.find(
    (mainProduct: IMainProduct) => mainProduct._id === value,
  );

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <Form.Control>
        <Select.Trigger>
          <span>{selectedMainProduct?.name || 'Select a main product'}</span>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {mainProduct?.map((mainProduct: IMainProduct) => (
          <Select.Item key={mainProduct._id} value={mainProduct._id}>
            {mainProduct.name} {mainProduct.code ? `(${mainProduct.code})` : ''}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
