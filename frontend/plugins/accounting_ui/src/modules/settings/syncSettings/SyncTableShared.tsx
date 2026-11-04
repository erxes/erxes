import type { TFunction } from 'i18next';
import { ColumnDef, Row } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell, Skeleton, Table } from 'erxes-ui';
import { useMemo } from 'react';
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

export const SyncInitialSkeleton = ({
  rows = 20,
  columns,
}: {
  rows?: number;
  columns: ColumnDef<IConfig>[];
}) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );
  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {columns.map((col, colIndex) => (
            <Table.Cell
              key={`${rowKey}-${col.id ?? colIndex}`}
              className="border-r-0 px-2"
            >
              <Skeleton className="h-4 w-full min-w-4" />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
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
    <RecordTableInlineCell onClick={() => openDetail(row.original._id)}>
      {renderVal}
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
      className="relative"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header showColumnSelector={showColumnSelector} />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && (
              <SyncInitialSkeleton rows={20} columns={columns} />
            )}
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
