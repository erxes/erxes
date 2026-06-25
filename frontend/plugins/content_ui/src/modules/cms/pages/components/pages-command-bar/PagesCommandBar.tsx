import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PagesDelete } from './delete/RemovePages';

export const PagesCommandbar = ({ refetch }: { refetch?: () => void }) => {
  const { t } = useTranslation('content');
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('x-selected', { count: table.getFilteredSelectedRowModel().rows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <PagesDelete
          pagesIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
          rows={table.getFilteredSelectedRowModel().rows}
          onRefetch={refetch}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
