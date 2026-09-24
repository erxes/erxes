import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRemoveCategories } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { TCategoryRow } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';

export const CategoriesCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeCategories, loading } = useRemoveCategories();

  const categoryIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => (row.original as TCategoryRow)._id);

  const handleDelete = () =>
    confirm({
      message: t('kb-confirm-delete-categories', {
        count: categoryIds.length,
        defaultValue: 'Are you sure you want to delete {{count}} categories?',
      }),
      options: {
        confirmationValue: 'delete',
        description: t(
          'kb-action-permanent',
          'This action is permanent and cannot be undone.',
        ),
      },
    }).then(async () => {
      try {
        await removeCategories(categoryIds);
        table.setRowSelection({});
        toast({
          title: t('success'),
          description: t('kb-categories-deleted', 'Categories deleted'),
          variant: 'success',
        });
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('something-went-wrong'),
          variant: 'destructive',
        });
      }
    });

  return (
    <CommandBar open={categoryIds.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: categoryIds.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          <IconTrash />
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
