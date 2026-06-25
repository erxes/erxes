import { IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('insurance');
  const insuranceType = cell.row.original;
  const { deleteInsuranceType, loading } = useDeleteInsuranceType();

  const handleDelete = async () => {
    if (
      window.confirm(t('confirm-delete-insurance-type'))
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
          {t('edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={handleDelete}
          disabled={loading}
          className="text-destructive"
        >
          <IconTrash size={16} />
          {t('delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
