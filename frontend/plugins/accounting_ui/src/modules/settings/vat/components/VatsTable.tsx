import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  MoreActionsCell,
  SettingsRowsTable,
  getSharedRowColumns,
  moreColumn,
} from '../../components/SettingsRowsTable';
import { toast, useConfirm, useQueryState } from 'erxes-ui';

import { IVatRow } from '../types/VatRow';
import { VatRowsCommandbar } from './VatRowsCommandbar';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useVatRows } from '../hooks/useVatRows';
import { useVatRowsRemove } from '../hooks/useVatRowsRemove';
import { vatRowDetailAtom } from '../states/vatRowStates';

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
