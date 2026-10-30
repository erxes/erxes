import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Button,
  CommandBar,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { AccountsInline } from '@/settings/account/components/AccountsInline';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import { FIXED_ASSET_ACCOUNT_CONFIG_CONTENT_TYPE } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import {
  SettingsRowsTable,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import {
  useFixedAssetAccountConfigMutations,
  useFixedAssetAccountConfigs,
} from '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs';
import { IFixedAssetAccountConfig } from '@/settings/fixed-assets/account-config/types/FixedAssetAccountConfig';

const AccountConfigMoreCell = ({
  cell,
}: {
  cell: Cell<IFixedAssetAccountConfig, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { openDetail } = useSettingsPanel(
    FIXED_ASSET_ACCOUNT_CONFIG_CONTENT_TYPE,
  );
  const { confirm } = useConfirm();
  const { remove } = useFixedAssetAccountConfigMutations();

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => openDetail(cell.row.original._id)}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item
              value="delete"
              onSelect={() =>
                confirm({
                  message: t('delete-this-account-configuration'),
                  options: {
                    okLabel: t('delete'),
                    cancelLabel: t('cancel-label'),
                  },
                }).then(() =>
                  remove({ variables: { _id: cell.row.original._id } }),
                )
              }
            >
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const getColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IFixedAssetAccountConfig>[] => [
  {
    ...moreColumn,
    cell: AccountConfigMoreCell,
  },
  RecordTable.checkboxColumn as ColumnDef<IFixedAssetAccountConfig>,
  {
    id: 'accountId',
    accessorKey: 'accountId',
    header: () => <RecordTable.InlineHead label={t('asset-account')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <AccountsInline
          accountIds={[cell.getValue() as string].filter((id): id is string =>
            Boolean(id),
          )}
          permissionMode="read"
        />
      </RecordTableInlineCell>
    ),
    size: 260,
  },
  {
    id: 'depreciationAccountId',
    accessorFn: (config) => config.value.depreciationAccountId,
    header: () => (
      <RecordTable.InlineHead label={t('accumulated-depreciation-account')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <AccountsInline
          accountIds={cell.getValue() ? [cell.getValue() as string] : []}
          permissionMode="read"
        />
      </RecordTableInlineCell>
    ),
    size: 260,
  },
  {
    id: 'taxAssetAccountId',
    accessorFn: (config) => config.value.taxAssetAccountId,
    header: () => <RecordTable.InlineHead label={t('deferred-tax-assets')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <AccountsInline
          accountIds={cell.getValue() ? [cell.getValue() as string] : []}
          permissionMode="read"
        />
      </RecordTableInlineCell>
    ),
    size: 260,
  },
  {
    id: 'taxLiabilityAccountId',
    accessorFn: (config) => config.value.taxLiabilityAccountId,
    header: () => (
      <RecordTable.InlineHead label={t('deferred-tax-liabilities')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <AccountsInline
          accountIds={cell.getValue() ? [cell.getValue() as string] : []}
          permissionMode="read"
        />
      </RecordTableInlineCell>
    ),
    size: 260,
  },
];

const FixedAssetAccountConfigsCommandbar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length}{' '}
          {t('selected-label-4')}
        </CommandBar.Value>
        <Separator.Inline />
        <FixedAssetAccountConfigsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const FixedAssetAccountConfigsDelete = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { remove, removing } = useFixedAssetAccountConfigMutations();

  const handleDelete = () =>
    confirm({
      message: t('delete-these-account-configurations'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel-label') },
    }).then(() => {
      table.getFilteredSelectedRowModel().rows.forEach((row) => {
        remove({
          variables: { _id: row.original._id },
          onCompleted: () => table.setRowSelection({}),
        });
      });
    });

  return (
    <Button variant="secondary" disabled={removing} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};

export const FixedAssetAccountConfigsTable = () => {
  const { t } = useTranslation('accounting');
  const { configs, loading, error } = useFixedAssetAccountConfigs();

  return (
    <SettingsRowsTable
      columns={getColumns(t)}
      data={configs || []}
      loading={loading}
      error={error}
      emptyAction={<AddFixedAssetAccountConfig />}
      stickyColumns={['more', 'checkbox', 'accountId']}
      className="m-3"
      Commandbar={FixedAssetAccountConfigsCommandbar}
      tableId="accounting_fixed_asset_account_configs_record_table"
    />
  );
};

export const AddFixedAssetAccountConfig = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={FIXED_ASSET_ACCOUNT_CONFIG_CONTENT_TYPE}
      label={t('add-account-configuration')}
    />
  );
};
