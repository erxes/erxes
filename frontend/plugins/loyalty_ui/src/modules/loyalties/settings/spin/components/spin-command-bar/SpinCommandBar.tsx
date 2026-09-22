import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DeleteSpin } from './delete/DeleteSpin';

export const SpinCommandBar = () => {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected-count', { count: table.getFilteredSelectedRowModel().rows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <DeleteSpin
          spinIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
