import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useRemoveTemplate } from '../../hooks/useTemplateRemove';
import { useTranslation } from 'react-i18next';

export const TemplateDelete = ({
  templateIds,
  rows,
}: {
  templateIds: string[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
  const { confirm } = useConfirm();
  const { removeTemplate } = useRemoveTemplate();

  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-confirm', { count: templateIds.length }),
        }).then(() => {
          removeTemplate(templateIds, {
            onError: (e: ApolloError) => {
              toast({
                title: t('error'),
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: t('success'),
                variant: 'success',
                description: t('delete-success'),
              });
            },
          });
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
