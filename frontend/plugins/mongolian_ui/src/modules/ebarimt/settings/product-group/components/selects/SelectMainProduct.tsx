import { useGetMainProduct } from '@/ebarimt/settings/product-group/hooks/useMainProduct';
import { IMainProduct } from '@/ebarimt/settings/product-group/types/mainProduct';
import { ProductSelectBase } from './ProductSelectBase';

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
    variables: { perPage: 500, page: 1 },
  });

  return (
    <ProductSelectBase
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      loading={loading}
      products={(mainProduct as IMainProduct[]) || []}
      placeholder="Select a main product"
    />
  );
};
