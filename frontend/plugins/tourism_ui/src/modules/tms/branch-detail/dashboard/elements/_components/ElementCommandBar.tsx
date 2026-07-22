import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useRemoveElements } from '../hooks/useRemoveElements';

export const ElementCommandBar = () => {
  const { t } = useTranslation('tourism');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };
  const { toast } = useToast();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const elementIds = selectedRows.map((row) => row.original._id);
  const selectedCount = elementIds.length;
  const { removeElements, loading } = useRemoveElements();

  const onRemove = () => {
    confirm({
      message: t('confirm-delete-elements', 'Are you sure you want to delete the {{count}} selected elements?', { count: selectedCount }),
      options: confirmOptions,
    }).then(() => {
      removeElements(elementIds)
        .then(() => {
          table.resetRowSelection();
          toast({
            title: t('success', 'Success'),
            variant: 'success',
            description: t('elements-deleted-successfully', 'Elements deleted successfully'),
          });
        })
        .catch((e: ApolloError) => {
          toast({
            title: t('error', 'Error'),
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  };

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('x-selected', '{{count}} selected', { count: selectedCount })}</CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          disabled={loading}
          onClick={onRemove}
        >
          {loading ? <Spinner /> : <IconTrash />}
          {t('delete', 'Delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
