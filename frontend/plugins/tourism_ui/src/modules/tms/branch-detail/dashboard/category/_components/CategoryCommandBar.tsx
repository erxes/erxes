import { ApolloError } from '@apollo/client';
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
import { useDeleteCategory } from '../hooks/useDeleteCategory';

export const CategoryCommandBar = () => {
  const { t } = useTranslation('tourism');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };
  const { toast } = useToast();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const categoryIds = selectedRows.map((row) => row.original._id);
  const selectedCount = categoryIds.length;
  const deleteCategory = useDeleteCategory();

  const onRemove = () => {
    confirm({
      message: t('confirm-delete-categories', { count: selectedCount }),
      options: confirmOptions,
    }).then(() => {
      Promise.all(
        categoryIds.map((id) => deleteCategory({ variables: { id } })),
      )
        .then(() => {
          table.resetRowSelection();
          toast({
            title: t('success'),
            variant: 'success',
            description: t('categories-deleted-successfully'),
          });
        })
        .catch((e: ApolloError) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  };

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('x-selected', { count: selectedCount })}</CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={onRemove}
        >
          <IconTrash />
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
