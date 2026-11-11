import type { User, UserRole } from '@erxes/core-contract';
import {
  IconAt,
  IconCalendarPlus,
  IconCheck,
  IconLabelFilled,
  IconMail,
  IconMailCheck,
  IconShieldHalf,
  IconUser,
  IconUserOff,
  IconUserCheck,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Badge,
  Combobox,
  Command,
  Popover,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextField,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useSession } from '~/modules/auth/session';
import {
  permissionsFor,
  ROLE_LABEL,
  STATUS_LABEL,
  useTeamMemberDisable,
  useTeamMemberEdit,
} from './useTeamMembers';

const SCOPE = 'core-team-members-inline';

const STATUS_BADGE: Record<User['status'], 'success' | 'secondary' | 'destructive'> = {
  active: 'success',
  invited: 'secondary',
  disabled: 'destructive',
};

const MoreCell = ({ user }: { user: User }) => {
  const { user: me } = useSession();
  const { canToggle } = permissionsFor(me, user);
  const toggle = useTeamMemberDisable();
  const { confirm } = useConfirm();
  const [open, setOpen] = useState(false);

  if (!canToggle) {
    return <div className="h-full w-full" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="h-full w-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            {user.status === 'disabled' ? (
              <Command.Item
                value="enable"
                onSelect={() => {
                  setOpen(false);
                  toggle.mutate({ id: user.id, disabled: false });
                }}
              >
                <IconUserCheck /> Enable
              </Command.Item>
            ) : (
              <Command.Item
                value="disable"
                className="text-destructive"
                onSelect={() => {
                  setOpen(false);
                  void confirm({
                    message: `Disable ${user.fullName || user.email}?`,
                    options: {
                      description: 'They are signed out at once and cannot sign in until enabled again.',
                      okLabel: 'Disable',
                      variants: { ok: 'destructive' },
                    },
                  }).then(() => toggle.mutate({ id: user.id, disabled: true }));
                }}
              >
                <IconUserOff /> Disable
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const NameCell = ({ user }: { user: User }) => {
  const { user: me } = useSession();
  const edit = useTeamMemberEdit();

  if (!permissionsFor(me, user).canEdit) {
    return <RecordTableInlineCell>{user.fullName || '—'}</RecordTableInlineCell>;
  }

  return (
    <TextField
      scope={`${SCOPE}.${user.id}.name`}
      value={user.fullName ?? ''}
      placeholder="Full name"
      onSave={(fullName) => fullName.trim() && edit.mutate({ id: user.id, fullName: fullName.trim() })}
    >
      {user.id === me.id && (
        <Badge variant="secondary" className="mr-1">
          You
        </Badge>
      )}
    </TextField>
  );
};

const UsernameCell = ({ user }: { user: User }) => {
  const { user: me } = useSession();
  const edit = useTeamMemberEdit();

  if (!permissionsFor(me, user).canEdit) {
    return <RecordTableInlineCell>{user.username || '—'}</RecordTableInlineCell>;
  }

  return (
    <TextField
      scope={`${SCOPE}.${user.id}.username`}
      value={user.username ?? ''}
      placeholder=""
      onSave={(username) => username.trim() && edit.mutate({ id: user.id, username: username.trim() })}
    />
  );
};

const RoleCell = ({ user }: { user: User }) => {
  const { user: me } = useSession();
  const { canChangeRole, roles } = permissionsFor(me, user);
  const edit = useTeamMemberEdit();
  const [open, setOpen] = useState(false);

  if (!canChangeRole) {
    return <RecordTableInlineCell>{ROLE_LABEL[user.role]}</RecordTableInlineCell>;
  }

  return (
    <PopoverScoped scope={`${SCOPE}.${user.id}.role`} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>{ROLE_LABEL[user.role]}</RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-44">
        <Command shouldFilter={false}>
          <Command.List>
            {roles.map((role: UserRole) => (
              <Command.Item
                key={role}
                value={role}
                onSelect={() => {
                  setOpen(false);
                  if (role !== user.role) edit.mutate({ id: user.id, role });
                }}
              >
                {ROLE_LABEL[role]}
                {role === user.role && <IconCheck className="ml-auto size-4" />}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** Team member columns, as in old core-ui (structure fields come later). */
export const teamMembersColumns: ColumnDef<User>[] = [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <MoreCell user={row.original} />,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<User>,
  {
    id: 'avatar',
    accessorKey: 'avatarUrl',
    header: () => <RecordTable.InlineHead icon={IconUser} label="" />,
    cell: ({ row }) => {
      const { avatarUrl, fullName, email } = row.original;

      return (
        <div className="flex h-8 items-center justify-center">
          <Avatar size="lg">
            {avatarUrl && <Avatar.Image src={avatarUrl} />}
            <Avatar.Fallback>{(fullName || email).charAt(0).toUpperCase()}</Avatar.Fallback>
          </Avatar>
        </div>
      );
    },
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'fullName',
    header: () => <RecordTable.InlineHead icon={IconLabelFilled} label="Name" />,
    cell: ({ row }) => <NameCell user={row.original} />,
    size: 240,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => <RecordTable.InlineHead icon={IconMail} label="Email" />,
    cell: ({ row }) => <RecordTableInlineCell>{row.original.email}</RecordTableInlineCell>,
    size: 250,
  },
  {
    id: 'username',
    accessorKey: 'username',
    header: () => <RecordTable.InlineHead icon={IconAt} label="Username" />,
    cell: ({ row }) => <UsernameCell user={row.original} />,
    size: 180,
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: () => <RecordTable.InlineHead icon={IconShieldHalf} label="Role" />,
    cell: ({ row }) => <RoleCell user={row.original} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconMailCheck} label="Status" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <Badge variant={STATUS_BADGE[row.original.status]}>{STATUS_LABEL[row.original.status]}</Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendarPlus} label="Added" />,
    cell: ({ row }) => (
      <RelativeDateDisplay value={row.original.createdAt} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={row.original.createdAt} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];
