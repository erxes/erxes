import type { User } from '@erxes/core-contract';
import { IconCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Command, DatePicker, PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';
import { UserAvatar } from '~/components/UserAvatar';
import { api } from '~/lib/api';

/** `YYYY-MM-DD` of a local date. */
export const toYmd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const formatYmd = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** A date (`YYYY-MM-DD`) edited in place with a calendar. */
export const DateInlineCell = ({
  value,
  scope,
  onSave,
}: {
  value: string | null;
  scope: string;
  onSave: (value: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        {value ? formatYmd(value) : <span className="text-muted-foreground" />}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-auto p-0">
        <DatePicker
          inline
          value={value}
          defaultMonth={value ? new Date(value) : undefined}
          onChange={(date) => {
            const next = date instanceof Date ? toYmd(date) : null;

            if (next !== value) onSave(next);
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** Active team members, for owner pickers. */
export const useMembers = () => {
  const query = useQuery({
    queryKey: ['users', 'options'],
    queryFn: () => api.users.list({ limit: 100, status: 'active' }),
    staleTime: 60_000,
  });

  return query.data?.data ?? [];
};

const memberName = (user: Pick<User, 'fullName' | 'email'>) => user.fullName || user.email;

/** A team member (e.g. the owner of a customer), picked in place. */
export const MemberInlineCell = ({
  value,
  scope,
  onSave,
}: {
  value: string | null;
  scope: string;
  onSave: (value: string | null) => void;
}) => {
  const members = useMembers();
  const [open, setOpen] = useState(false);
  const current = members.find((member) => member.id === value);

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        {current && (
          <span className="flex min-w-0 items-center gap-2">
            <UserAvatar name={memberName(current)} src={current.avatarUrl} className="size-5" />
            <span className="truncate">{memberName(current)}</span>
          </span>
        )}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-64 p-0">
        <Command>
          <Command.Input placeholder="Search team members" />
          <Command.List className="max-h-72 p-1">
            <Command.Empty>No team members</Command.Empty>
            {value && (
              <Command.Item
                value="__none"
                onSelect={() => {
                  setOpen(false);
                  onSave(null);
                }}
              >
                <span className="text-muted-foreground">No owner</span>
              </Command.Item>
            )}
            {members.map((member) => (
              <Command.Item
                key={member.id}
                value={`${memberName(member)} ${member.email}`}
                onSelect={() => {
                  setOpen(false);

                  if (member.id !== value) onSave(member.id);
                }}
              >
                <UserAvatar name={memberName(member)} src={member.avatarUrl} className="size-5" />
                <span className="flex-1 truncate">{memberName(member)}</span>
                {member.id === value && <IconCheck className="size-4 text-primary" />}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
