import { IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('insurance');
  const user = cell.row.original;
  const { deleteVendorUser } = useDeleteVendorUser();

  const handleDelete = async () => {
    if (confirm(t('confirm-delete-user'))) {
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
          {t('edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={handleDelete} className="text-destructive">
          <IconTrash size={16} />
          {t('delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
