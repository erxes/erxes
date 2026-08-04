import { useRemoveResponse } from '@/responseTemplate/hooks/useRemoveResponse';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, Spinner, toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ResponseDelete = ({
  responseIds,
  rows,
}: {
  responseIds: string[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { removeResponse, loading } = useRemoveResponse();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={() =>
        confirm({
          message: t('confirm-delete-responses', { count: responseIds.length }),
        }).then(async () => {
          try {
            await Promise.all(
              responseIds.map((id) =>
                removeResponse({ variables: { id } }),
              ),
            );
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: t('success'),
              variant: 'success',
              description: t('responses-deleted-successfully', { count: responseIds.length }),
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
