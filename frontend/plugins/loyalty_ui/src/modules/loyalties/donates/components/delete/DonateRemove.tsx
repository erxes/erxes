import { Row } from '@tanstack/table-core';
import { Button, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useDeleteDonate } from '../../hooks/useDeleteDonate';
import { IDonate } from '../../types/donate';
import { IconTrash } from '@tabler/icons-react';

interface DonateRemoveProps {
  donateIds: string[];
  rows: Row<IDonate>[];
}

export const DonateRemove = ({ donateIds, rows }: DonateRemoveProps) => {
  const { toast } = useToast();
  const { deleteDonate, loading } = useDeleteDonate();
  const { t } = useTranslation('loyalty');

  const handleDelete = async () => {
    try {
      await deleteDonate({ _ids: donateIds });
      toast({
        title: t('success'),
        description: t('donations-deleted', { count: donateIds.length }),
        variant: 'default',
      });
    } catch {
      // Error handled in useDeleteDonate
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <IconTrash className="h-4 w-4" />
      {t('delete')}
    </Button>
  );
};
