import { useQueryState } from 'erxes-ui';
import { SelectBrand } from 'ui-modules';

export const ProductBrandFilterBar = () => {
  const [filter, setFilter] = useQueryState<string>('brand');

  return (
    <SelectBrand
      value={filter || ''}
      onValueChange={(value) => setFilter(value as string)}
    />
  );
};
