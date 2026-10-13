import { useTranslation } from 'react-i18next';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useAccountCategoriesRemove } from '../hooks/useAccountCategoriesRemove';
import { IconTrash } from '@tabler/icons-react';

export const AccountCategoriesCommandbar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length}{' '}
          {t('selected-label-4')}
        </CommandBar.Value>
        <Separator.Inline />
        <AccountCategoriesDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const AccountCategoriesDelete = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeAccountCategories, loading } = useAccountCategoriesRemove();

  const handleDelete = () => {
    confirm({
      message: t('are-you-sure-you-want-to-delete-these-account-categories'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel-label'),
      },
    }).then(() => {
      const accountCategoryIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);
      accountCategoryIds.forEach((accountCategoryId) => {
        removeAccountCategories({
          variables: { _id: accountCategoryId },
          onError: (error: Error) => {
            toast({
              title: t('error'),
              description: error.message,
              variant: 'destructive',
            });
          },
          onCompleted: () => {
            table.setRowSelection({});
            toast({
              title: t('success'),
              description: t('account-category-deleted-successfully-label'),
            });
          },
        });
      });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
