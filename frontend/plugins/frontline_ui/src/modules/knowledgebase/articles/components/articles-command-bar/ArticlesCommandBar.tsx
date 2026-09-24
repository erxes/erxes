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
import { useRemoveArticles } from '@/knowledgebase/articles/hooks/useArticleMutations';
import { IArticle } from '@/knowledgebase/types';

export const ArticlesCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeArticles, loading } = useRemoveArticles();

  const articleIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => (row.original as IArticle)._id);

  const handleDelete = () =>
    confirm({
      message: t('kb-confirm-delete-articles', {
        count: articleIds.length,
        defaultValue: 'Are you sure you want to delete {{count}} articles?',
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
        await removeArticles(articleIds);
        table.setRowSelection({});
        toast({
          title: t('success'),
          description: t('kb-articles-deleted', 'Articles deleted'),
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
    <CommandBar open={articleIds.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: articleIds.length })}
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
