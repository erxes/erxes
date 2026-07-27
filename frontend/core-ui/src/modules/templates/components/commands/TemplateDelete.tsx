import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRemoveTemplate } from '../../hooks/useTemplateRemove';

export const TemplateDelete = ({
  templateIds,
  rows,
}: {
  templateIds: string[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('templates');
  const { confirm } = useConfirm();
  const { removeTemplate } = useRemoveTemplate();

  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('messages.delete-confirm', 'Are you sure you want to delete this template?'),
        }).then(() => {
          removeTemplate(templateIds, {
            onError: (e: ApolloError) => {
              toast({
                title: t('error', 'Error'),
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: t('success', 'Success'),
                variant: 'success',
                description: t('messages.delete-success', 'Template deleted successfully'),
              });
            },
          });
        })
      }
    >
      <IconTrash />
      {t('delete', 'Delete')}
    </Button>
  );
};
