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

import { CtaxRowsCommandbar } from '@/settings/ctax/components/CtaxRowsCommandbar';
import { ICtaxRow } from '@/settings/ctax/types/CtaxRow';
import { useCtaxRows } from '@/settings/ctax/hooks/useCtaxRows';
import { useCtaxRowEdit } from '@/settings/ctax/hooks/useCtaxRowEdit';
import { useCtaxRowsRemove } from '@/settings/ctax/hooks/useCtaxRowsRemove';
import { useTranslation } from 'react-i18next';
import { AddCtaxs } from '@/settings/ctax/components/AddCtaxs';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { CTAX_ROW_CONTENT_TYPE } from '@/settings/constants/settingsPanel';

export const CtaxMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICtaxRow, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { openDetail } = useSettingsPanel(CTAX_ROW_CONTENT_TYPE);
  const { confirm } = useConfirm();
  const { removeCtaxRows } = useCtaxRowsRemove();

  const handleEdit = () => {
    openDetail(cell.row.original._id);
  };

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure-delete-this-account'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      void removeCtaxRows({
        variables: { ctaxRowIds: [cell.row.original._id] },
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('city-tax-row-deleted-successfully'),
          });
        },
      });
    });

  return <MoreActionsCell onEdit={handleEdit} onDelete={handleDelete} />;
};

export const CtaxRowTextField = ({
  row,
  field,
}: SettingsRowTextFieldProps<ICtaxRow>) => {
  const { t } = useTranslation('accounting');
  const { editCtaxRow } = useCtaxRowEdit();

  return (
    <TextField
      value={row[field] ?? ''}
      scope={`ctax-row-${row._id}-${field}`}
      onSave={(value) => {
        if (!value.trim()) return;
        void editCtaxRow({
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

export const ctaxRowMoreColumn = {
  ...moreColumn,
  cell: CtaxMoreColumnCell,
};

export const ctaxRowsColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<ICtaxRow>[] =>
  getSharedRowColumns(
    ctaxRowMoreColumn as ColumnDef<ICtaxRow>,
    t,
    CtaxRowTextField,
  );

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
