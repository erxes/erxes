import { IconEdit, IconFileText, IconTrash } from '@tabler/icons-react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { useRemoveCategories } from '@/knowledgebase/categories/hooks/useCategoryMutations';
import { TCategoryRow } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';

const CategoriesMoreColumnCell = ({
  cell,
}: {
  cell: Cell<TCategoryRow, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, title } = cell.row.original;
  const { topicId = '' } = useParams();
  const [, setEditId] = useQueryState<string>('editId');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeCategories } = useRemoveCategories();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);

    confirm({
      message: t('kb-confirm-delete-category', {
        title: title || t('unnamed-category'),
        defaultValue:
          'Are you sure you want to delete "{{title}}"? This will also delete all associated articles.',
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
        await removeCategories([_id]);
        toast({
          title: t('success'),
          description: t('kb-category-deleted', 'Category deleted'),
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
              value="articles"
              onSelect={() => {
                setOpen(false);
                navigate(
                  `${KNOWLEDGE_BASE_PATH}/${topicId}/articles?categoryId=${_id}`,
                );
              }}
            >
              <IconFileText /> {t('kb-view-articles', 'View articles')}
            </Command.Item>
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

export const categoriesMoreColumn: ColumnDef<TCategoryRow> = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: CategoriesMoreColumnCell,
  size: 33,
};
