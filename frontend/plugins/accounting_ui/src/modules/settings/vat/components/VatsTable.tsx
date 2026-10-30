import type { TFunction } from 'i18next';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  MoreActionsCell,
  SettingsRowTextFieldProps,
  SettingsRowsTable,
  getSharedRowColumns,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import { TextField, toast, useConfirm } from 'erxes-ui';

import { IVatRow } from '@/settings/vat/types/VatRow';
import { VatRowsCommandbar } from '@/settings/vat/components/VatRowsCommandbar';
import { useTranslation } from 'react-i18next';
import { useVatRows } from '@/settings/vat/hooks/useVatRows';
import { useVatRowEdit } from '@/settings/vat/hooks/useVatRowEdit';
import { useVatRowsRemove } from '@/settings/vat/hooks/useVatRowsRemove';
import { AddVats } from '@/settings/vat/components/AddVats';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { VAT_ROW_CONTENT_TYPE } from '@/settings/constants/settingsPanel';

export const VatRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IVatRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { openDetail } = useSettingsPanel(VAT_ROW_CONTENT_TYPE);
  const { confirm } = useConfirm();
  const { removeVatRows } = useVatRowsRemove();

  const handleEdit = () => {
    openDetail(cell.row.original._id);
  };

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-this-vat-row'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      void removeVatRows({
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

export const VatRowTextField = ({
  row,
  field,
}: SettingsRowTextFieldProps<IVatRow>) => {
  const { t } = useTranslation('accounting');
  const { editVatRow } = useVatRowEdit();

  return (
    <TextField
      value={row[field] ?? ''}
      scope={`vat-row-${row._id}-${field}`}
      onSave={(value) => {
        if (!value.trim()) return;
        void editVatRow({
          variables: { _id: row._id, [field]: value },
          onCompleted: () => {
            toast({ title: t('success'), variant: 'success' });
          },
        });
      }}
      className="shadow-none rounded-none px-2"
    />
  );
};

export const vatRowMoreColumn = {
  ...moreColumn,
  cell: VatRowMoreColumnCell,
};

export const vatRowsColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IVatRow>[] =>
  getSharedRowColumns(
    vatRowMoreColumn as ColumnDef<IVatRow>,
    t,
    VatRowTextField,
  );

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
