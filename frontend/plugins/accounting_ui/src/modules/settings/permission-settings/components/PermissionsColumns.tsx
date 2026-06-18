import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  NumberField,
  Popover,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useState } from 'react';
import {
  ACCOUNT_PERMISSIONS,
  IPermission,
  PermissionReadScope,
  PermissionWriteScope,
} from '../types/Permission';
import { usePermissionEdit } from '../hooks/usePermissionEdit';

type ScopeOption = (typeof ACCOUNT_PERMISSIONS)['READ' | 'WRITE'][number];

const ScopeDisplay = ({ option }: { option: ScopeOption }) => {
  const Icon = option.icon;
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      {option.label}
    </span>
  );
};

const PermissionLevelCell = ({
  cell,
}: {
  cell: Cell<IPermission, unknown>;
}) => {
  const { original } = cell.row;
  const { editPermission } = usePermissionEdit();
  const value = original.level ?? 0;

  return (
    <NumberField
      value={value}
      scope={`permission-${original._id}-level`}
      onSave={(next) => {
        if (next === value) return;
        editPermission(original, { level: next });
      }}
      className="rounded-none px-2"
    />
  );
};

const PermissionInlineScopeCell = ({
  value,
  options,
  onChange,
  placeholder = '-',
}: {
  value?: string;
  options: ReadonlyArray<ScopeOption>;
  onChange: (next: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        {selected ? <ScopeDisplay option={selected} /> : placeholder}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Command>
          <Command.Input placeholder="Search" />
          <Command.List className="p-1">
            <Command.Empty>No results found</Command.Empty>
            {options.map((option) => (
              <Command.Item
                key={option.value}
                value={option.label}
                onSelect={() => {
                  if (option.value !== value) onChange(option.value);
                  setOpen(false);
                }}
              >
                <ScopeDisplay option={option} />
                <Combobox.Check checked={value === option.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

export const PermissionScopeSelect = ({
  value,
  options,
  onChange,
  placeholder = '',
  triggerVariant = 'ghost',
  triggerClassName,
  hideChevron = true,
}: {
  value?: string;
  options: ReadonlyArray<ScopeOption>;
  onChange: (next: string) => void;
  placeholder?: string;
  triggerVariant?: 'ghost' | 'outline' | 'secondary';
  triggerClassName?: string;
  hideChevron?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <Combobox.Trigger
        variant={triggerVariant}
        className={triggerClassName ?? 'w-full font-normal'}
        hideChevron={hideChevron}
      >
        {selected ? (
          <ScopeDisplay option={selected} />
        ) : (
          <Combobox.Value placeholder={placeholder} />
        )}
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search" />
          <Command.List className="p-1">
            <Command.Empty>No results found</Command.Empty>
            {options.map((option) => (
              <Command.Item
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <ScopeDisplay option={option} />
                <Combobox.Check checked={value === option.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const PermissionReadCell = ({ cell }: { cell: Cell<IPermission, unknown> }) => {
  const { original } = cell.row;
  const { editPermission } = usePermissionEdit();

  return (
    <PermissionInlineScopeCell
      value={original.read}
      options={ACCOUNT_PERMISSIONS.READ}
      onChange={(next) =>
        editPermission(original, { read: next as PermissionReadScope })
      }
    />
  );
};

const PermissionWriteCell = ({
  cell,
}: {
  cell: Cell<IPermission, unknown>;
}) => {
  const { original } = cell.row;
  const { editPermission } = usePermissionEdit();

  return (
    <PermissionInlineScopeCell
      value={original.write}
      options={ACCOUNT_PERMISSIONS.WRITE}
      onChange={(next) =>
        editPermission(original, { write: next as PermissionWriteScope })
      }
    />
  );
};

export const permissionsColumns: ColumnDef<IPermission>[] = [
  RecordTable.checkboxColumn as ColumnDef<IPermission>,
  {
    id: 'accountName',
    accessorFn: (row) => row.account?.name,
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
    size: 240,
  },
  {
    id: 'accountCode',
    accessorFn: (row) => row.account?.code,
    header: () => <RecordTable.InlineHead label="Code" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
    size: 110,
  },
  {
    id: 'email',
    accessorFn: (row) => row.user?.email,
    header: () => <RecordTable.InlineHead label="Email" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'level',
    accessorKey: 'level',
    header: () => <RecordTable.InlineHead label="Level" />,
    cell: PermissionLevelCell,
    size: 120,
  },
  {
    id: 'read',
    accessorKey: 'read',
    header: () => <RecordTable.InlineHead label="Read" />,
    cell: PermissionReadCell,
    size: 220,
  },
  {
    id: 'write',
    accessorKey: 'write',
    header: () => <RecordTable.InlineHead label="Write" />,
    cell: PermissionWriteCell,
    size: 220,
  },
];
