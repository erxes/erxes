import { CommandBar, Separator, Button, RecordTable, toast } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useTranslation } from 'react-i18next';

interface MenusCommandBarProps {
  onBulkDelete: (ids: string[]) => Promise<void>;
}

export const MenusCommandBar = ({ onBulkDelete }: MenusCommandBarProps) => {
  const { t } = useTranslation('content');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row: any) => row.original._id as string,
  );

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('x-selected', { count: selectedRows.length })}</CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          size="sm"
          onClick={() =>
            confirm({
              message: t('confirm-delete-x-menus', { count: selectedIds.length }),
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: t('success'), variant: 'default' });
              } catch (e: any) {
                toast({
                  title: t('error'),
                  description: e?.message || t('failed-to-delete-menus'),
                  variant: 'destructive',
                });
              }
            })
          }
        >
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
