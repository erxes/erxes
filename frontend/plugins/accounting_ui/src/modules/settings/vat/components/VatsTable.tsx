import type { TFunction } from 'i18next';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  MoreActionsCell,
  SettingsRowsTable,
  getSharedRowColumns,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import { toast, useConfirm, useQueryState } from 'erxes-ui';

import { IVatRow } from '@/settings/vat/types/VatRow';
import { VatRowsCommandbar } from '@/settings/vat/components/VatRowsCommandbar';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useVatRows } from '@/settings/vat/hooks/useVatRows';
import { useVatRowsRemove } from '@/settings/vat/hooks/useVatRowsRemove';
import { vatRowDetailAtom } from '@/settings/vat/states/vatRowStates';
import { AddVats } from '@/settings/vat/components/AddVats';

export const VatRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IVatRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState<string>('vat_row_id');
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

  return <MoreActionsCell onEdit={handleEdit} onDelete={handleDelete} />;
};

export const vatRowMoreColumn = {
  ...moreColumn,
  cell: VatRowMoreColumnCell,
};

export const vatRowsColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IVatRow>[] =>
  getSharedRowColumns(vatRowMoreColumn as ColumnDef<IVatRow>, t);

export const VatRowsTable = () => {
  const { t } = useTranslation('accounting');
  const { vatRows, loading, error, handleFetchMore, totalCount } = useVatRows();

  return (
    <SettingsRowsTable
      columns={vatRowsColumns(t)}
      data={vatRows || []}
      loading={loading}
      error={error}
      emptyAction={<AddVats />}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={VatRowsCommandbar}
      tableId="accounting_vat_rows_record_table"
    />
  );
};
