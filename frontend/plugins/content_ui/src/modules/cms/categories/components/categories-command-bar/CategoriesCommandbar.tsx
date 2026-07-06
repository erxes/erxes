import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CategoriesDelete } from './delete/CategoriesDelete';
import { CategoriesBulkEdit } from './CategoriesBulkEdit';

interface CategoriesCommandBarProps {
  clientPortalId: string;
  onBulkDelete?: (ids: string[]) => Promise<void> | void;
}

export const CategoriesCommandBar = ({
  clientPortalId,
  onBulkDelete,
}: CategoriesCommandBarProps) => {
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
        {onBulkDelete && (
          <>
            <Separator.Inline />
            <CategoriesDelete
              selectedIds={selectedIds}
              selectedRows={selectedRows}
              onBulkDelete={onBulkDelete}
            />
          </>
        )}
        <Separator.Inline />
        <CategoriesBulkEdit clientPortalId={clientPortalId} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
