import type { TFunction } from 'i18next';
import { ColumnDef, Row } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconRefreshOff } from '@tabler/icons-react';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddAccountingConfig } from '@/settings/syncSettings/AddAccountingConfig';
import { ACCOUNTING_SETTINGS_CODES } from '@/settings/constants/settingsRoutes';
import { IConfig } from '@/settings/types/Config';
import { useAccountingConfigs } from '@/settings/hooks/useAccountingConfigs';
import { useAccountingConfigEdit } from '@/settings/hooks/useAccountingConfigEdit';
import { getSyncConfigContentType } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

type TPendingSyncConfigUpdate = {
  value: Record<string, unknown>;
  queue: Promise<unknown>;
};

const pendingSyncConfigUpdates = new Map<string, TPendingSyncConfigUpdate>();

export const useSyncConfigValueUpdate = (config: IConfig) => {
  const { editConfig } = useAccountingConfigEdit();

  return (key: string, fieldValue?: string[] | string) => {
    const pending = pendingSyncConfigUpdates.get(config._id);
    const value = {
      ...(pending?.value ?? config.value),
      [key]: Array.isArray(fieldValue) ? fieldValue[0] : fieldValue,
    };

    const queue = (pending?.queue ?? Promise.resolve())
      .catch(() => undefined)
      .then(() => editConfig({ id: config._id, subId: config.subId, value }))
      .finally(() => {
        if (pendingSyncConfigUpdates.get(config._id)?.queue === queue) {
          pendingSyncConfigUpdates.delete(config._id);
        }
      });

    pendingSyncConfigUpdates.set(config._id, { value, queue });
  };
};

export const SyncLinkCell = ({
  row,
  renderVal,
}: {
  row: Row<IConfig>;
  renderVal: string;
}) => {
  const { openDetail } = useSettingsPanel(
    getSyncConfigContentType(row.original.code),
  );
  return (
    <RecordTableInlineCell>
      {renderVal ? (
        <RecordTableInlineCell.Anchor
          onClick={() => openDetail(row.original._id)}
        >
          {renderVal}
        </RecordTableInlineCell.Anchor>
      ) : null}
    </RecordTableInlineCell>
  );
};

export const syncBaseColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IConfig>[] => [
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label={t('code')} />,
    cell: ({ cell }) => (
      <SyncLinkCell row={cell.row} renderVal={cell.row.original?.code} />
    ),
    size: 250,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label={t('title')} />,
    cell: ({ cell }) => (
      <SyncLinkCell
        row={cell.row}
        renderVal={cell.row.original?.value?.title}
      />
    ),
  },
];

export const SyncConfigTable = ({
  code,
  columns,
  stickyColumns = ['more', 'code'],
  tableId,
  showColumnSelector = false,
}: {
  code: ACCOUNTING_SETTINGS_CODES;
  columns: ColumnDef<IConfig>[];
  stickyColumns?: string[];
  tableId?: string;
  showColumnSelector?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { configs, loading, error } = useAccountingConfigs({
    variables: { code },
  });
  const isInitialLoading = loading && !configs?.length;

  const isEmpty = !loading && !configs?.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={isInitialLoading ? [] : configs || []}
      stickyColumns={stickyColumns}
      tableId={tableId}
      className="relative m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header showColumnSelector={showColumnSelector} />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <RecordTable.RowSkeleton rows={20} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconRefreshOff}
          description={t('empty-list-description')}
          action={<AddAccountingConfig code={code} />}
        />
      )}
    </RecordTable.Provider>
  );
};
