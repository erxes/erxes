import { ColumnDef } from '@tanstack/table-core';
import { Checkbox } from 'erxes-ui';

export const gatewayCheckboxColumn: ColumnDef<any> = {
  accessorKey: 'checkbox',
  id: 'checkbox',
  header: ({ table }) => {
    const isAllSelected = table.getIsAllPageRowsSelected();
    const isSomeSelected = table.getIsSomePageRowsSelected();

    return (
      <div className="flex items-center justify-center h-8">
        <Checkbox
          checked={isAllSelected || (isSomeSelected && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      </div>
    );
  },
  size: 33,
  cell: ({ row }) => (
    <div
      className="flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    </div>
  ),
};
