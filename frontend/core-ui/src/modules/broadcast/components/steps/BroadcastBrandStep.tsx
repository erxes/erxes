import { IBrand } from 'ui-modules';
import { useBrands } from 'ui-modules/modules/brands/hooks/useBrands';
import { BroadcastBrandChooser } from '../chooser/BroadcastBrandChooser';

export const BroadcastBrandStep = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const { brands = [] as IBrand[] } = useBrands();

  return (
    <BroadcastBrandChooser brands={brands} value={value} onChange={onChange} />
  );
};
