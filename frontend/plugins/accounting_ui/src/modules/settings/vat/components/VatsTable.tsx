import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  useQueryState,
  Popover,
  Combobox,
  Command,
  useConfirm,
  toast,
  RecordTable,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { useVatRows } from '../hooks/useVatRows';
import { useVatRowsRemove } from '../hooks/useVatRowsRemove';
import { vatRowDetailAtom } from '../states/vatRowStates';
import { IVatRow } from '../types/VatRow';
import { VatRowsCommandbar } from './VatRowsCommandbar';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  SettingsRowsTable,
  getSharedRowColumns,
} from '../../components/SettingsRowsTable';

export const VatRowsTable = () => {
  const { vatRows, loading, handleFetchMore, totalCount } = useVatRows();

  return (
    <SettingsRowsTable
      columns={vatRowsColumns}
      data={vatRows || []}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={VatRowsCommandbar}
    />
  );
};

export const VatRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IVatRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState('vat_row_id');
  const setVatRowDetail = useSetAtom(vatRowDetailAtom);
  const { confirm } = useConfirm();
  const { removeVatRows } = useVatRowsRemove();

  const handleEdit = () => {
    setVatRowDetail(cell.row.original);
    setOpen(cell.row.original._id);
  };

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-this-vat-row'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      removeVatRows({
        variables: { vatRowIds: [cell.row.original._id] },
        onError: (error: Error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('vat-rows-deleted-successfully'),
          });
        },
      });
    });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
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
    </Popover>
  );
};

export const vatRowMoreColumn = {
  id: 'more',
  cell: VatRowMoreColumnCell,
  size: 33,
};

export const vatRowsColumns: ColumnDef<IVatRow>[] = getSharedRowColumns(
  vatRowMoreColumn as ColumnDef<IVatRow>,
);
