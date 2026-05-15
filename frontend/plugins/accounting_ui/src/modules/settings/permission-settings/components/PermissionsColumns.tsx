import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  NumberField,
  Popover,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import {
  IconBan,
  IconChevronsDown,
  IconChevronsUp,
  IconEqual,
  IconPlus,
  IconUser,
  type Icon,
  type IconProps,
} from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes, useState } from 'react';
import {
  ACCOUNT_PERMISSION_SCOPES,
  ACCOUNT_PERMISSION_WRITE_SCOPES,
  IPermission,
  PERMISSION_READ_LABELS,
  PERMISSION_WRITE_LABELS,
  PermissionReadScope,
  PermissionWriteScope,
} from '../types/Permission';
import { usePermissionEdit } from '../hooks/usePermissionEdit';

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;

const SCOPE_ICONS: Record<string, TablerIcon> = {
  none: IconBan,
  own: IconUser,
  add: IconPlus,
  ltLvl: IconChevronsDown,
  lteLvl: IconEqual,
  gtLvl: IconChevronsUp,
};

const ScopeIcon = ({ scope }: { scope?: string }) => {
  if (!scope) return null;
  const Icon = SCOPE_ICONS[scope];
  if (!Icon) return null;
  return <Icon className="size-4 shrink-0 text-muted-foreground" />;
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
  labels,
  onChange,
  placeholder = '-',
}: {
  value?: string;
  options: readonly string[];
  labels: Record<string, string>;
  onChange: (next: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        {value ? (
          <span className="inline-flex items-center gap-2">
            <ScopeIcon scope={value} />
            {labels[value]}
          </span>
        ) : (
          placeholder
        )}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Command>
          <Command.Input placeholder="Search" />
          <Command.List className="p-1">
            <Command.Empty>No results found</Command.Empty>
            {options.map((scope) => (
              <Command.Item
                key={scope}
                value={labels[scope]}
                onSelect={() => {
                  if (scope !== value) onChange(scope);
                  setOpen(false);
                }}
              >
                <ScopeIcon scope={scope} />
                {labels[scope]}
                <Combobox.Check checked={value === scope} />
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
  labels,
  onChange,
  placeholder = '',
  triggerVariant = 'ghost',
  triggerClassName,
  hideChevron = true,
}: {
  value?: string;
  options: readonly string[];
  labels: Record<string, string>;
  onChange: (next: string) => void;
  placeholder?: string;
  triggerVariant?: 'ghost' | 'outline' | 'secondary';
  triggerClassName?: string;
  hideChevron?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <Combobox.Trigger
        variant={triggerVariant}
        className={triggerClassName ?? 'w-full font-normal'}
        hideChevron={hideChevron}
      >
        {value ? (
          <span className="inline-flex items-center gap-2">
            <ScopeIcon scope={value} />
            {labels[value]}
          </span>
        ) : (
          <Combobox.Value placeholder={placeholder} />
        )}
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search" />
          <Command.List className="p-1">
            <Command.Empty>No results found</Command.Empty>
            {options.map((scope) => (
              <Command.Item
                key={scope}
                value={labels[scope]}
                onSelect={() => {
                  onChange(scope);
                  setOpen(false);
                }}
              >
                <ScopeIcon scope={scope} />
                {labels[scope]}
                <Combobox.Check checked={value === scope} />
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
      options={ACCOUNT_PERMISSION_SCOPES.VALUES}
      labels={PERMISSION_READ_LABELS}
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
      options={ACCOUNT_PERMISSION_WRITE_SCOPES.VALUES}
      labels={PERMISSION_WRITE_LABELS}
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
