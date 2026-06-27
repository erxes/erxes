import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Row } from '@tanstack/react-table';
import { CustomTypesDelete } from './delete/CustomTypesDelete';
import { ICustomPostType } from '../../types/customTypeTypes';

interface CustomTypesCommandBarProps {
  onBulkDelete: (ids: string[]) => Promise<void> | void;
}

export const CustomTypesCommandBar = ({
  onBulkDelete,
}: CustomTypesCommandBarProps) => {
  const { t } = useTranslation('content');
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel()
    .rows as Row<ICustomPostType>[];
  const selectedIds = selectedRows.map((row) => row.original._id);

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
