import { Button, toast } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Row } from '@tanstack/react-table';
import { ICustomPostType } from '../../../types/customTypeTypes';

export const CustomTypesDelete = ({
  selectedIds,
  selectedRows,
  onBulkDelete,
}: {
  selectedIds: string[];
  selectedRows: Row<ICustomPostType>[];
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
          message: t('confirm-delete-x-custom-types', { count: selectedIds.length }),
          }).then(async () => {
            try {
              await onBulkDelete(selectedIds);
              selectedRows.forEach((row) => row.toggleSelected(false));
              toast({ title: t('success'), variant: 'default' });
            } catch (error: unknown) {
              toast({
                title: t('error'),
                description:
                  error instanceof Error
                    ? error.message
                    : t('failed-to-delete-custom-types'),
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
