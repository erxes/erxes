import { PageSubHeader } from 'erxes-ui';

import { InventoryCategoryRecordTable } from '../msdynamic-check-category/components/InventoryCategoryRecordTable';
import { InventoryCategoryCheckButton } from '../msdynamic-check-category/components/InventoryCategoryCheckButton';
import { InventoryCategoryFilter } from '../msdynamic-check-category/components/InventoryCategoryFilter';

/* MSDynamic check category page-iin filter, action, table layout-iig haruulna */
export const InventoryCategoryContainer = () => {
  return (
    <>
      <PageSubHeader className="flex justify-between items-center">
        <InventoryCategoryFilter />
        <InventoryCategoryCheckButton />
      </PageSubHeader>

      <InventoryCategoryRecordTable />
    </>
  );
};
