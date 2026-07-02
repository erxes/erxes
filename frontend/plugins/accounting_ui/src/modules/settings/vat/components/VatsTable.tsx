import { Cell, ColumnDef } from '@tanstack/react-table';
import { useQueryState, useConfirm, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { useVatRows } from '../hooks/useVatRows';
import { useVatRowsRemove } from '../hooks/useVatRowsRemove';
import { vatRowDetailAtom } from '../states/vatRowStates';
import { IVatRow } from '../types/VatRow';
import { VatRowsCommandbar } from './VatRowsCommandbar';
import {
  SettingsRowsTable,
  getSharedRowColumns,
  MoreActionsCell,
  moreColumn,
} from '../../components/SettingsRowsTable';

/** more column actions cell for vat rows. */
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

  /** open edit sheet for selected row. */
  const handleEdit = () => {
    setVatRowDetail(cell.row.original);
    setOpen(cell.row.original._id);
  };

  /** delete selected vat row after confirmation. */
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
    <MoreActionsCell cell={cell} onEdit={handleEdit} onDelete={handleDelete} />
  );
};

export const vatRowMoreColumn = {
  ...moreColumn,
  cell: VatRowMoreColumnCell,
};

export const vatRowsColumns: ColumnDef<IVatRow>[] = getSharedRowColumns(
  vatRowMoreColumn as ColumnDef<IVatRow>,
);

/** settings rows table layout-oor vat rows table */
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
