import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';
import { useRemovePage } from '../../../hooks/useRemovePage';

export const PagesDelete = ({
  pagesIds,
  rows,
  onRefetch,
}: {
  pagesIds: string[];
  rows: Row<any>[];
  onRefetch?: () => void;
}) => {
  const { t } = useTranslation('content');
  const { confirm } = useConfirm();
  const { removePage } = useRemovePage();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('confirm-delete-x-pages', { count: pagesIds.length }),
        }).then(() => {
          Promise.all(pagesIds.map((pageId) => removePage(pageId)))
            .then(() => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: t('success'),
                variant: 'success',
                description: t('pages-deleted-successfully'),
              });

              onRefetch?.();
            })
            .catch((e: ApolloError) => {
              toast({
                title: t('error'),
                description: e.message,
                variant: 'destructive',
              });
            });
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
