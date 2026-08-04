import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTemplateCategoryRemove } from '../../hooks/useTemplateCategoryRemove';
import { TemplateCategory } from '@/templates/types/TemplateCategory';

export const TemplateCategoryDelete = ({
  templateCategoryIds,
  rows,
}: {
  templateCategoryIds: string[];
  rows: Row<TemplateCategory>[];
}) => {
  const { confirm } = useConfirm();
  const { templateCategoryRemove } = useTemplateCategoryRemove();

  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${templateCategoryIds.length} selected template categor${templateCategoryIds.length === 1 ? 'y' : 'ies'}?`,
        }).then(() => {
          templateCategoryRemove({
            variables: { _ids: templateCategoryIds },
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              rows.forEach((row) => {
                row.toggleSelected(false);
              });
              toast({
                title: 'Success',
                variant: 'success',
                description: `Template categor${templateCategoryIds.length === 1 ? 'y' : 'ies'} deleted successfully`,
              });
            },
          });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
