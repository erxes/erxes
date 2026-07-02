import { Cell, ColumnDef } from '@tanstack/react-table';
import { useQueryState, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCtaxRows } from '../hooks/useCtaxRows';
import { ICtaxRow } from '../types/CtaxRow';
import { CtaxRowsCommandbar } from './CtaxRowsCommandbar';
import { useCtaxRowsRemove } from '../hooks/useCtaxRowsRemove';
import {
  SettingsRowsTable,
  getSharedRowColumns,
  MoreActionsCell,
  moreColumn,
} from '../../components/SettingsRowsTable';

/** more column actions cell for ctax rows. */
export const CtaxMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICtaxRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState('ctax_row_id');
  const { confirm } = useConfirm();
  const { removeCtaxRows } = useCtaxRowsRemove();

  /** open edit sheet for selected row. */
  const handleEdit = () => {
    setOpen(cell.row.original._id);
  };

  /** delete selected ctax row after confirmation. */
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

  return (
    <MoreActionsCell cell={cell} onEdit={handleEdit} onDelete={handleDelete} />
  );
};

export const ctaxRowMoreColumn = {
  ...moreColumn,
  cell: CtaxMoreColumnCell,
};

export const ctaxRowsColumns: ColumnDef<ICtaxRow>[] = getSharedRowColumns(
  ctaxRowMoreColumn as ColumnDef<ICtaxRow>,
);

/** ctax rows table with record table. */
export const CtaxRowsTable = () => {
  const { ctaxRows, loading, handleFetchMore, totalCount } = useCtaxRows();

  return (
    <SettingsRowsTable
      columns={ctaxRowsColumns}
      data={ctaxRows || []}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={CtaxRowsCommandbar}
    />
  );
};
