import { CommandBar, RecordTable } from 'erxes-ui';
import { PosCoverDelete } from './delete/PosCoverDelete';
import { useTranslation } from 'react-i18next';

export const PosCoverCommandBar = () => {
  const { t } = useTranslation('sales');
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected')}
        </CommandBar.Value>
        <PosCoverDelete
          productIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
