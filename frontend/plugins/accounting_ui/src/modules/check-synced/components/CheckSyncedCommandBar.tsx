import { IconCircleCheck, IconRefresh } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const getSyncButtonLabel = (
  t: (key: string, options?: Record<string, unknown>) => string,
  {
    canSync,
    syncing,
    count,
  }: {
    canSync: boolean;
    syncing: boolean;
    count: number;
  },
) => {
  if (syncing) return t('syncing');
  if (!canSync) return t('select-rule-to-sync');
  return t('sync-selected', { count });
};

export const CheckSyncedCommandBar = ({
  canSync,
  checking,
  syncing,
  toSyncCount,
  onCheck,
  onSync,
  checkLabel,
  RulePicker,
}: {
  canSync: boolean;
  checking: boolean;
  syncing: boolean;
  toSyncCount: number;
  onCheck: (ids: string[]) => void;
  onSync: () => void;
  checkLabel: string;
  RulePicker: ComponentType<{ children: ReactNode }>;
}) => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows
    .map((row) => row.original._id)
    .filter(Boolean);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {selectedRows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          onClick={() => onCheck(selectedIds)}
          disabled={checking || !selectedIds.length}
          variant="secondary"
        >
          <IconCircleCheck />
          {checking ? t('checking') : t(checkLabel)}
        </Button>
        {canSync ? (
          <Button
            onClick={onSync}
            disabled={syncing || !toSyncCount}
            variant="secondary"
          >
            <IconRefresh />
            {getSyncButtonLabel(t, { canSync, syncing, count: toSyncCount })}
          </Button>
        ) : (
          <RulePicker>
            <Button variant="secondary" disabled={syncing}>
              <IconRefresh />
              {getSyncButtonLabel(t, { canSync, syncing, count: toSyncCount })}
            </Button>
          </RulePicker>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
