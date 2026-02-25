import { IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useDeleteRiskType } from '~/modules/insurance/hooks';

export const RisksMoreColumn = ({ cell }: { cell: any }) => {
  const riskId = cell.row.original.id;
  const riskName = cell.row.original.name;
  const { deleteRiskType, loading } = useDeleteRiskType();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${riskName}"?`)) {
      try {
        await deleteRiskType({ variables: { id: riskId } });
      } catch (error) {
        console.error('Error deleting risk type:', error);
      }
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
        <DropdownMenu.Item
          onClick={() => {
            const event = new CustomEvent('edit-risk-type', {
              detail: cell.row.original,
            });
            window.dispatchEvent(event);
          }}
        >
          <IconEdit size={16} />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={handleDelete}
          disabled={loading}
          className="text-destructive"
        >
          <IconTrash size={16} />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
