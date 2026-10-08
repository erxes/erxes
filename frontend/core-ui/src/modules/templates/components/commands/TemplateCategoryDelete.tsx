import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTemplateCategoryRemove } from '../../hooks/useTemplateCategoryRemove';
import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { useTranslation } from 'react-i18next';

export const TemplateCategoryDelete = ({
  templateCategoryIds,
  rows,
}: {
  templateCategoryIds: string[];
  rows: Row<TemplateCategory>[];
}) => {
  const { t } = useTranslation('templates', { keyPrefix: 'template-category' });
  const { confirm } = useConfirm();
  const { templateCategoryRemove } = useTemplateCategoryRemove();

  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('delete-confirm', { count: templateCategoryIds.length }),
        }).then(() => {
          templateCategoryRemove({
            variables: { _ids: templateCategoryIds },
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
                description: t('delete-success', {
                  count: templateCategoryIds.length,
                }),
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
