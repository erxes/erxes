import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemoveArticles } from '@/knowledgebase/articles/hooks/useArticleMutations';
import { IArticle } from '@/knowledgebase/types';

const ArticlesMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IArticle, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, title } = cell.row.original;
  const [, setEditId] = useQueryState<string>('editId');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeArticles } = useRemoveArticles();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);

    confirm({
      message: t('kb-confirm-delete-article', {
        title: title || t('kb-untitled-article', 'Untitled article'),
        defaultValue: 'Are you sure you want to delete "{{title}}"?',
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
        await removeArticles([_id]);
        toast({
          title: t('success'),
          description: t('kb-article-deleted', 'Article deleted'),
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
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => {
                setOpen(false);
                setEditId(_id);
              }}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const articlesMoreColumn: ColumnDef<IArticle> = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: ArticlesMoreColumnCell,
  size: 33,
};
