import { IconCircleCheck, IconRefresh } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AccountingCheckSyncedDealRulePicker } from './AccountingCheckSyncedDealRuleSelect';

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

export const AccountingCheckSyncedDealsCommandBar = ({
  canSync,
  checking,
  syncing,
  toSyncCount,
  onCheck,
  onSync,
}: {
  canSync: boolean;
  checking: boolean;
  syncing: boolean;
  toSyncCount: number;
  onCheck: (ids: string[]) => void;
  onSync: () => void;
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
          {checking ? t('checking') : t('check-deals')}
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
          <AccountingCheckSyncedDealRulePicker>
            <Button variant="secondary" disabled={syncing}>
              <IconRefresh />
              {getSyncButtonLabel(t, { canSync, syncing, count: toSyncCount })}
            </Button>
          </AccountingCheckSyncedDealRulePicker>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
