import { ScrollArea } from 'erxes-ui';
import { IPackageProduct } from '../../types/Package';
import { PackageProductPicker } from '../PackageProductPicker';

// The Products tab: the package's products with their quantities, and what
// Create found wrong.
export const PackagePanelProducts = ({
  value,
  error,
  onChange,
}: {
  value: IPackageProduct[];
  error?: string;
  onChange: (products: IPackageProduct[]) => void;
}) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className="flex min-w-0 flex-col gap-1 p-3">
      <PackageProductPicker value={value} onChange={onChange} />
      {error && <p className="px-1 text-xs text-destructive">{error}</p>}
    </div>
  </ScrollArea>
);
