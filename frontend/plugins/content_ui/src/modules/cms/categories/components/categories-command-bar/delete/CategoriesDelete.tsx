import { Button, toast } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const CategoriesDelete = ({
  selectedIds,
  selectedRows,
  onBulkDelete,
}: {
  selectedIds: string[];
  selectedRows: any[];
  onBulkDelete: (ids: string[]) => Promise<void> | void;
}) => {
  const { t } = useTranslation('content');
  const { confirm } = useConfirm();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      size="sm"
      onClick={() =>
        confirm({
          message: t('confirm-delete-x-categories', { count: selectedIds.length }),
        }).then(async () => {
          try {
            await onBulkDelete(selectedIds);
            selectedRows.forEach((row: any) => row.toggleSelected(false));
            toast({ title: t('success'), variant: 'default' });
          } catch (e: any) {
            toast({
              title: t('error'),
              description: e?.message || t('failed-to-delete-categories'),
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash className="mr-2 h-4 w-4" /> {t('delete')}
    </Button>
  );
};
