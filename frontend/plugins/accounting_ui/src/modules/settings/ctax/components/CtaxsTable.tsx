import type { TFunction } from 'i18next';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  MoreActionsCell,
  SettingsRowsTable,
  getSharedRowColumns,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import { useConfirm, useQueryState } from 'erxes-ui';

import { CtaxRowsCommandbar } from '@/settings/ctax/components/CtaxRowsCommandbar';
import { ICtaxRow } from '@/settings/ctax/types/CtaxRow';
import { useCtaxRows } from '@/settings/ctax/hooks/useCtaxRows';
import { useCtaxRowsRemove } from '@/settings/ctax/hooks/useCtaxRowsRemove';
import { useTranslation } from 'react-i18next';
import { AddCtaxs } from '@/settings/ctax/components/AddCtaxs';

export const CtaxMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICtaxRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState<string>('ctax_row_id');
  const { confirm } = useConfirm();
  const { removeCtaxRows } = useCtaxRowsRemove();

  const handleEdit = () => {
    setOpen(cell.row.original._id);
  };

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-this-account'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      removeCtaxRows({
        variables: { ctaxRowIds: [cell.row.original._id] },
      });
    });

  return <MoreActionsCell onEdit={handleEdit} onDelete={handleDelete} />;
};

export const ctaxRowMoreColumn = {
  ...moreColumn,
  cell: CtaxMoreColumnCell,
};

export const ctaxRowsColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<ICtaxRow>[] =>
  getSharedRowColumns(ctaxRowMoreColumn as ColumnDef<ICtaxRow>, t);

export const CtaxRowsTable = () => {
  const { t } = useTranslation('accounting');
  const { ctaxRows, loading, error, handleFetchMore, totalCount } =
    useCtaxRows();

  return (
    <SettingsRowsTable
      columns={ctaxRowsColumns(t)}
      data={ctaxRows || []}
      loading={loading}
      error={error}
      emptyAction={<AddCtaxs />}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={CtaxRowsCommandbar}
      tableId="accounting_ctax_rows_record_table"
    />
  );
};
