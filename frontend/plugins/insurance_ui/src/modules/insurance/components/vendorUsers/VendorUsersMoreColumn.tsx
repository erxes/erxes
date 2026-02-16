import { IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useDeleteVendorUser } from '~/modules/insurance/hooks';

export const VendorUsersMoreColumn = ({
  cell,
  onEdit,
  onRefetch,
}: {
  cell: any;
  onEdit: (user: any) => void;
  onRefetch: () => void;
}) => {
  const user = cell.row.original;
  const { deleteVendorUser } = useDeleteVendorUser();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteVendorUser(user.id);
      onRefetch();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <IconDotsVertical size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item onClick={() => onEdit(user)}>
          <IconEdit size={16} />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={handleDelete} className="text-destructive">
          <IconTrash size={16} />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
