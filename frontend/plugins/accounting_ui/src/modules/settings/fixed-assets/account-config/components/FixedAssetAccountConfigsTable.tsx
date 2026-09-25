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
              <IconEdit /> Засах
            </Command.Item>
            <Command.Item
              value="delete"
              onSelect={() =>
                confirm({
                  message: 'Дансны багцыг устгах уу?',
                  options: { okLabel: 'Устгах', cancelLabel: 'Болих' },
                }).then(() =>
                  remove({ variables: { _id: cell.row.original._id } }),
                )
              }
            >
              <IconTrash /> Устгах
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
    header: () => <RecordTable.InlineHead label="Хөрөнгийн данс" />,
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
    header: () => <RecordTable.InlineHead label="Хур. элэгдлийн данс" />,
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
    header: () => (
      <RecordTable.InlineHead label="Хойшлогдсон татварын хөрөнгө" />
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
    id: 'taxLiabilityAccountId',
    accessorFn: (config) => config.value.taxLiabilityAccountId,
    header: () => <RecordTable.InlineHead label="Хойшлогдсон татварын өр" />,
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
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} сонгосон
        </CommandBar.Value>
        <Separator.Inline />
        <FixedAssetAccountConfigsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const FixedAssetAccountConfigsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { remove, removing } = useFixedAssetAccountConfigMutations();

  const handleDelete = () =>
    confirm({
      message: 'Эдгээр дансны багцыг устгах уу?',
      options: { okLabel: 'Устгах', cancelLabel: 'Болих' },
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
      Устгах
    </Button>
  );
};

export const FixedAssetAccountConfigsTable = () => {
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
        <AccountingSheet title="Дансны багц засах" className="md:max-w-3xl">
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
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button onClick={() => setOpen(true)}>
          <IconPlus /> Дансны багц нэмэх
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title="Дансны багц нэмэх" className="md:max-w-3xl">
        <AccountConfigSheet onClose={() => setOpen(false)} />
      </AccountingSheet>
    </Sheet>
  );
};
