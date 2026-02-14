import { IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useDeleteInsuranceType } from '~/modules/insurance/hooks';

interface InsuranceTypesMoreColumnProps {
  cell: any;
  onEdit?: (insuranceType: any) => void;
  onDeleted?: () => void;
}

export const InsuranceTypesMoreColumn = ({
  cell,
  onEdit,
  onDeleted,
}: InsuranceTypesMoreColumnProps) => {
  const insuranceType = cell.row.original;
  const { deleteInsuranceType, loading } = useDeleteInsuranceType();

  const handleDelete = async () => {
    if (
      window.confirm('Are you sure you want to delete this insurance type?')
    ) {
      try {
        await deleteInsuranceType({ variables: { id: insuranceType.id } });
        onDeleted?.();
      } catch (error) {
        console.error('Error deleting insurance type:', error);
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
        <DropdownMenu.Item onClick={() => onEdit?.(insuranceType)}>
          <IconEdit size={16} />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
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
