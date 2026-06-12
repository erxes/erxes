import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';

import { InventoryCategoryItem } from '../types/inventoryCategory';

/* Renders the standard RecordTable more button for category comparison rows. */
export const InventoryCategoryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<InventoryCategoryItem, unknown>;
}) => {
  return <RecordTable.MoreButton className="w-full h-full" />;
};

export const InventoryCategoryMoreColumn = {
  id: 'more',
  cell: InventoryCategoryMoreColumnCell,
  size: 33,
};
