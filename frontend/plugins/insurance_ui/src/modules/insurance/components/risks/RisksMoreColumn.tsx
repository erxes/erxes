import { IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useDeleteRiskType } from '~/modules/insurance/hooks';
import { Cell } from '@tanstack/table-core';
import type { RiskType } from '~/modules/insurance/types';

export const RisksMoreColumn = ({
  cell,
}: {
  cell: Cell<RiskType, unknown>;
}) => {
  const { t } = useTranslation('insurance');
  const riskId = cell.row.original.id;
  const { deleteRiskType, loading } = useDeleteRiskType();

  const handleDelete = async () => {
    if (window.confirm(t('confirm-delete-risk-type'))) {
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
        <Button variant="ghost" size="icon" className="h-8 w-full">
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
          {t('edit')}
        </DropdownMenu.Item>
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
