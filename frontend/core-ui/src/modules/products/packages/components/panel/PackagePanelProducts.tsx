import { IPackageProduct } from '../../types/Package';
import { PackageProductPicker } from '../PackageProductPicker';

// The Products tab: every product, the package's checked with a quantity.
export const PackagePanelProducts = ({
  value,
  error,
  onChange,
  onTotalChange,
}: {
  value: IPackageProduct[];
  error?: string;
  onChange: (products: IPackageProduct[]) => void;
  onTotalChange?: (total: number) => void;
}) => (
  <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
    {error && <p className="shrink-0 text-xs text-destructive">{error}</p>}
    <PackageProductPicker
      value={value}
      onChange={onChange}
      onTotalChange={onTotalChange}
    />
  </div>
);
