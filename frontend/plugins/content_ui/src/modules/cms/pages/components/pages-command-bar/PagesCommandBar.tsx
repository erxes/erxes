import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PagesDelete } from './delete/RemovePages';
import { PagesBulkEdit } from './PagesBulkEdit';

interface PagesCommandbarProps {
  clientPortalId: string;
  refetch?: () => void;
}

export const PagesCommandbar = ({ clientPortalId, refetch }: PagesCommandbarProps) => {
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
        <Separator.Inline />
        <PagesBulkEdit clientPortalId={clientPortalId} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
