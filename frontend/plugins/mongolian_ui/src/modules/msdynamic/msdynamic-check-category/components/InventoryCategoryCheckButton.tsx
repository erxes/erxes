import { Button } from 'erxes-ui';
import { SelectBrand, SelectCategory } from 'ui-modules';

import { useCheckCategory } from '../hooks/useCheckCategory';

export const InventoryCategoryCheckButton = () => {
  const { loading, queryParams, setBrand, setCategory, toCheckCategory } =
    useCheckCategory();

  const handleCheck = async () => {
    await toCheckCategory();
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button onClick={handleCheck} disabled={loading}>
        {loading ? 'Checking...' : 'Check'}
      </Button>
      <SelectCategory
        className="w-52"
        value={queryParams.categoryId || ''}
        placeholder="Select category"
        onValueChange={(val) => setCategory(Array.isArray(val) ? val[0] : val)}
      />
      <SelectBrand
        className="w-52"
        value={queryParams.brandId || ''}
        placeholder="Select brand"
        onValueChange={(val) => setBrand(Array.isArray(val) ? val[0] : val)}
      />
    </div>
  );
};
