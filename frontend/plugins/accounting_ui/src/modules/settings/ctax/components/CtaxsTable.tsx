import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  useQueryState,
  Popover,
  Combobox,
  Command,
  useConfirm,
  RecordTable,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCtaxRows } from '../hooks/useCtaxRows';
import { ICtaxRow } from '../types/CtaxRow';
import { CtaxRowsCommandbar } from './CtaxRowsCommandbar';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useCtaxRowsRemove } from '../hooks/useCtaxRowsRemove';
import {
  SettingsRowsTable,
  getSharedRowColumns,
} from '../../components/SettingsRowsTable';

/** ctax row iin more actions cell (edit/delete) bn */
export const CtaxMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICtaxRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState('ctax_row_id');
  const { confirm } = useConfirm();
  const { removeCtaxRows } = useCtaxRowsRemove();
  /** songogdson row edit sheet neeh */
  const handleEdit = () => {
    setOpen(cell.row.original._id);
  };

  /** songogdson ctax row delete hiih */
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

  const actionsMenu = (
    <Combobox.Content>
      <Command shouldFilter={false}>
        <Command.List>
          <Command.Item value="edit" onSelect={handleEdit}>
            <IconEdit /> {t('edit')}
          </Command.Item>
          <Command.Item value="delete" onSelect={handleDelete}>
            <IconTrash /> {t('delete')}
          </Command.Item>
        </Command.List>
      </Command>
    </Combobox.Content>
  );

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      {actionsMenu}
    </Popover>
  );
};

export const ctaxRowMoreColumn = {
  id: 'more',
  cell: CtaxMoreColumnCell,
  size: 33,
};

export const ctaxRowsColumns: ColumnDef<ICtaxRow>[] = getSharedRowColumns(
  ctaxRowMoreColumn as ColumnDef<ICtaxRow>,
);

/** settings rows table layout-oor ctax rows table */
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
