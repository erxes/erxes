import { useRemoveForm } from '@/forms/hooks/useRemoveForm';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, Spinner, toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const FormDelete = ({
  formIds,
  rows,
}: {
  formIds: string[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();

  const { removeForm, loading } = useRemoveForm();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={() =>
        confirm({
          message: t('confirm-delete-forms', { count: formIds.length }),
        }).then(async () => {
          try {
            await removeForm(formIds);
            rows.forEach((row) => {
              row.toggleSelected(false);
            });
            toast({
              title: t('success'),
              variant: 'success',
              description: t('forms-deleted', { count: formIds.length }),
            });
          } catch (e: any) {
            toast({
              title: t('error'),
              description: e.message,
              variant: 'destructive',
            });
          }
        })
      }
    >
      {loading ? <Spinner /> : <IconTrash />}
      {t('delete')}
    </Button>
  );
};
