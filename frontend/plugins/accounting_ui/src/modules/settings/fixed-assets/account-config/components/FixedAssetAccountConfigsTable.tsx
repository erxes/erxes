import { zodResolver } from '@hookform/resolvers/zod';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  ScrollArea,
  Sheet,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AccountsInline } from '@/settings/account/components/AccountsInline';
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
            <Command.Item value="edit" onSelect={() => onEdit(cell.row.original)}>
              <IconEdit /> Засах
            </Command.Item>
            <Command.Item
              value="delete"
              onSelect={() =>
                confirm({
                  message: 'Дансны багцыг устгах уу?',
                  options: { okLabel: 'Устгах', cancelLabel: 'Болих' },
                }).then(() => remove({ variables: { _id: cell.row.original._id } }))
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
  { id: 'more', cell: (props) => <AccountConfigMoreCell {...props} onEdit={onEdit} />, size: 33 },
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
    header: () => <RecordTable.InlineHead label="Хойшлогдсон татварын хөрөнгө" />,
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

export const FixedAssetAccountConfigsTable = () => {
  const { configs } = useFixedAssetAccountConfigs();
  const [selectedConfig, setSelectedConfig] = useState<IFixedAssetAccountConfig>();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const columns = getColumns((config) => setSelectedConfig(config));

  return (
    <>
      <RecordTable.Provider
        columns={columns}
        data={configs || []}
        stickyColumns={['more', 'accountId']}
        className="m-3"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Provider>
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <Sheet.Trigger asChild>
          <Button className="absolute top-3 right-3" onClick={() => setIsAddOpen(true)}>
            <IconPlus /> Дансны багц нэмэх
          </Button>
        </Sheet.Trigger>
        <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none">
          <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
            <Sheet.Title>Дансны багц нэмэх</Sheet.Title><Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="overflow-hidden flex-auto"><ScrollArea className="h-full"><div className="p-5"><AccountConfigSheet onClose={() => setIsAddOpen(false)} /></div></ScrollArea></Sheet.Content>
        </Sheet.View>
      </Sheet>
      <Sheet open={Boolean(selectedConfig)} onOpenChange={(open) => !open && setSelectedConfig(undefined)}>
        <Sheet.View className="p-0 flex flex-col gap-0 overflow-hidden flex-none">
          <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
            <Sheet.Title>Дансны багц засах</Sheet.Title><Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="overflow-hidden flex-auto"><ScrollArea className="h-full"><div className="p-5">{selectedConfig && <AccountConfigSheet config={selectedConfig} onClose={() => setSelectedConfig(undefined)} />}</div></ScrollArea></Sheet.Content>
        </Sheet.View>
      </Sheet>
    </>
  );
};
