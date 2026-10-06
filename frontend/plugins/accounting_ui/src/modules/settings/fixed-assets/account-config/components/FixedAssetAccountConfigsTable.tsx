import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
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
  Sheet,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AccountsInline } from '@/settings/account/components/AccountsInline';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import {
  SettingsRowsTable,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import {
  FIXED_ASSET_ACCOUNT_CONFIG_DEFAULT_VALUES,
  fixedAssetAccountConfigSchema,
} from '../constants/schema';
import {
  useFixedAssetAccountConfigMutations,
  useFixedAssetAccountConfigs,
} from '../hooks/useFixedAssetAccountConfigs';
import {
  IFixedAssetAccountConfig,
  TFixedAssetAccountConfigForm,
} from '../types/FixedAssetAccountConfig';
import { FixedAssetAccountConfigForm } from './FixedAssetAccountConfigForm';

const AccountConfigMoreCell = ({
  cell,
  onEdit,
}: {
  cell: Cell<IFixedAssetAccountConfig, unknown>;
  onEdit: (config: IFixedAssetAccountConfig) => void;
}) => {
  const { t } = useTranslation('accounting');

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
              onSelect={() => onEdit(cell.row.original)}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item
              value="delete"
              onSelect={() =>
                confirm({
                  message: t(
                    'are-you-sure-you-want-to-delete-this-account-configuration',
                  ),
                  options: { okLabel: t('delete'), cancelLabel: t('cancel') },
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
  onEdit: (config: IFixedAssetAccountConfig) => void,
): ColumnDef<IFixedAssetAccountConfig>[] => [
  {
    ...moreColumn,
    cell: (props) => <AccountConfigMoreCell {...props} onEdit={onEdit} />,
  },
  RecordTable.checkboxColumn as ColumnDef<IFixedAssetAccountConfig>,
  {
    id: 'accountId',
    accessorKey: 'accountId',
    header: () => <HeaderCell labelKey="asset-account" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <AccountsInline
          accountIds={[cell.getValue() as string]}
          permissionMode="read"
        />
      </RecordTableInlineCell>
    ),
    size: 260,
  },
  {
    id: 'depreciationAccountId',
    accessorFn: (config) => config.value.depreciationAccountId,
    header: () => <HeaderCell labelKey="accumulated-depreciation-account" />,
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
    header: () => <HeaderCell labelKey="deferred-tax-asset" />,
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
    header: () => <HeaderCell labelKey="deferred-tax-liability" />,
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

const AccountConfigSheet = ({
  config,
  onClose,
}: {
  config?: IFixedAssetAccountConfig;
  onClose: () => void;
}) => {
  const form = useForm<TFixedAssetAccountConfigForm>({
    resolver: zodResolver(fixedAssetAccountConfigSchema),
    defaultValues: config
      ? { accountId: config.accountId, value: config.value }
      : FIXED_ASSET_ACCOUNT_CONFIG_DEFAULT_VALUES,
  });
  const { add, edit, adding, editing } = useFixedAssetAccountConfigMutations();

  const handleSubmit = (data: TFixedAssetAccountConfigForm) => {
    const options = {
      variables: config ? { _id: config._id, ...data } : data,
      onCompleted: onClose,
    };

    if (config) {
      edit(options);
      return;
    }

    add(options);
  };

  return (
    <FixedAssetAccountConfigForm
      form={form}
      handleSubmit={handleSubmit}
      loading={adding || editing}
    />
  );
};

const FixedAssetAccountConfigsCommandbar = () => {
  const { t } = useTranslation('accounting');

  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected-4')}
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
      message: t(
        'are-you-sure-you-want-to-delete-the-selected-account-configurations',
      ),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
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

  const { configs, loading } = useFixedAssetAccountConfigs();
  const [selectedConfig, setSelectedConfig] =
    useState<IFixedAssetAccountConfig>();
  const columns = getColumns((config) => setSelectedConfig(config));

  return (
    <>
      <SettingsRowsTable
        columns={columns}
        data={configs || []}
        loading={loading}
        stickyColumns={['more', 'checkbox', 'accountId']}
        className="m-3"
        Commandbar={FixedAssetAccountConfigsCommandbar}
        tableId="accounting_fixed_asset_account_configs_record_table"
      />
      <Sheet
        open={Boolean(selectedConfig)}
        onOpenChange={(open) => !open && setSelectedConfig(undefined)}
      >
        <AccountingSheet
          title={t('edit-account-configuration')}
          className="md:max-w-3xl"
        >
          {selectedConfig && (
            <AccountConfigSheet
              config={selectedConfig}
              onClose={() => setSelectedConfig(undefined)}
            />
          )}
        </AccountingSheet>
      </Sheet>
    </>
  );
};

export const AddFixedAssetAccountConfig = () => {
  const { t } = useTranslation('accounting');

  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button onClick={() => setOpen(true)}>
          <IconPlus /> {t('add-account-configuration')}
        </Button>
      </Sheet.Trigger>
      <AccountingSheet
        title={t('add-account-configuration')}
        className="md:max-w-3xl"
      >
        <AccountConfigSheet onClose={() => setOpen(false)} />
      </AccountingSheet>
    </Sheet>
  );
};
