import { IconEye, IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { InsuranceProduct } from '~/modules/insurance/types';

interface ProductsMoreColumnProps {
  cell: any;
  onEdit: (product: InsuranceProduct) => void;
  onDelete: (product: InsuranceProduct) => void;
}

export const ProductsMoreColumn = ({
  cell,
  onEdit,
  onDelete,
}: ProductsMoreColumnProps) => {
  const product = cell.row.original as InsuranceProduct;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <IconDotsVertical size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item onClick={() => onEdit(product)}>
          <IconEdit size={16} />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => onDelete(product)}
          className="text-red-600"
        >
          <IconTrash size={16} />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
