import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CustomTypesDelete } from './delete/CustomTypesDelete';

interface CustomTypesCommandBarProps {
  onBulkDelete: (ids: string[]) => Promise<void> | void;
}

export const CustomTypesCommandBar = ({
  onBulkDelete,
}: CustomTypesCommandBarProps) => {
  const { t } = useTranslation('content');
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row: any) => row.original._id as string,
  );

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('x-selected', { count: selectedRows.length })}</CommandBar.Value>
        <Separator.Inline />
        <CustomTypesDelete
          selectedIds={selectedIds}
          selectedRows={selectedRows}
          onBulkDelete={onBulkDelete}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
