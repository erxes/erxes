import { PageSubHeader } from 'erxes-ui';

import { InventoryCategoryRecordTable } from './InventoryCategoryRecordTable';
import { InventoryCategoryCheckButton } from './InventoryCategoryCheckButton';
import { InventoryCategoryFilter } from './InventoryCategoryFilter';

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
