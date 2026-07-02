import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { ICategory } from '../types/category';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import { CategoryEditSheet } from './CategoryEditSheet';

export const categoryMoreColumn = (
  branchLanguages?: string[],
  mainLanguage?: string,
): ColumnDef<ICategory & { hasChildren: boolean }> => ({
  id: 'more',
  cell: (props) => (
    <CategoryMoreColumn
      {...props}
      branchLanguages={branchLanguages}
      mainLanguage={mainLanguage}
    />
  ),
  size: 33,
});

export const CategoryMoreColumn = (
  props: CellContext<ICategory & { hasChildren: boolean }, unknown> & {
    branchLanguages?: string[];
    mainLanguage?: string;
  },
) => {
  const { t } = useTranslation('tourism');
  const { branchLanguages, mainLanguage } = props;
  const category = props.row.original;
  const [editOpen, setEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const deleteCategory = useDeleteCategory();

  const handleEdit = () => {
    setEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-category'),
      options: { confirmationValue: 'delete' },
    })
      .then(() => {
        deleteCategory({ variables: { id: category._id } })
          .then(() => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('category-deleted-successfully'),
            });
          })
          .catch((e: any) => {
            toast({
              title: t('error'),
              description: e.message,
              variant: 'destructive',
            });
          });
      })
      .catch((e: unknown) => {
        if (e instanceof Error) {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        }
      });
  };

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={handleEdit}>
                <IconEdit className="w-4 h-4" />
                {t('edit')}
              </Command.Item>
              <Command.Item value="delete" onSelect={handleDelete}>
                <IconTrash className="w-4 h-4" />
                {t('delete')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <CategoryEditSheet
        category={category}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
      />
    </>
  );
};
