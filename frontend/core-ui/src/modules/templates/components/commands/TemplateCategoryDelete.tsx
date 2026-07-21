import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTemplateCategoryRemove } from '../../hooks/useTemplateCategoryRemove';
import { TemplateCategory } from '@/templates/types/TemplateCategory';

export const TemplateCategoryDelete = ({
  templateCategoryIds,
  rows,
}: {
  templateCategoryIds: string[];
  rows: Row<TemplateCategory>[];
}) => {
  const { t } = useTranslation('templates');
  const { confirm } = useConfirm();
  const { templateCategoryRemove } = useTemplateCategoryRemove();

  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('category.delete-confirm', 'Are you sure you want to delete the selected template categories?'),
        }).then(() => {
          templateCategoryRemove({
            variables: { _ids: templateCategoryIds },
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
                description: t('category.delete-success', 'Template category deleted successfully'),
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
