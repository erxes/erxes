import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  MoreActionsCell,
  SettingsRowsTable,
  getSharedRowColumns,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import { useConfirm, useQueryState } from 'erxes-ui';

import { CtaxRowsCommandbar } from './CtaxRowsCommandbar';
import { ICtaxRow } from '../types/CtaxRow';
import { useCtaxRows } from '../hooks/useCtaxRows';
import { useCtaxRowsRemove } from '../hooks/useCtaxRowsRemove';
import { useTranslation } from 'react-i18next';

export const CtaxMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICtaxRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState('ctax_row_id');
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
