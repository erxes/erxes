import type { User, UserRole } from '@erxes/core-contract';
import { IconCheck } from '@tabler/icons-react';
import { Command, PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TEAM_MEMBERS_HOTKEY_SCOPE } from '../constants';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';

/** Old `TeamMemberRoleSelect`: owners pick any role, admins admin or member. */
export const TeamMemberRoleSelect = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [open, setOpen] = useState(false);
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);
  const value = <span className="font-medium capitalize">{user.role}</span>;

  if (!permissions?.canChangeRole) {
    return <RecordTableInlineCell>{value}</RecordTableInlineCell>;
  }

  const handleRoleChange = (role: UserRole) => {
    if (role === user.role) return setOpen(false);

    edit.mutate({ id: user.id, role }, { onSuccess: () => setOpen(false) });
  };

  return (
    <PopoverScoped
      scope={`${TEAM_MEMBERS_HOTKEY_SCOPE}.${user.id}.role`}
      open={open}
      onOpenChange={setOpen}
    >
      <RecordTableInlineCell.Trigger>{value}</RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Command>
          <Command.Input placeholder={t('search-role')} />
          <Command.List>
            <Command.Empty>{t('no-results-found')}</Command.Empty>
            {permissions.roles.map((role) => (
              <Command.Item
                key={role}
                value={role}
                onSelect={() => handleRoleChange(role)}
                className="font-medium capitalize"
              >
                <span className="flex items-center gap-2">
                  {role}
                  {user.role === role && <IconCheck className="text-primary size-4" />}
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
