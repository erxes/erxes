import { useGetSubProduct } from '@/ebarimt/settings/product-group/hooks/useSubProduct';
import { ISubProduct } from '@/ebarimt/settings/product-group/types/subProduct';
import { ProductSelectBase } from './ProductSelectBase';

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
    variables: { perPage: 500, page: 1 },
  });

  return (
    <ProductSelectBase
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      loading={loading}
      products={(subProducts as ISubProduct[]) || []}
      placeholder="Select a sub product"
    />
  );
};
