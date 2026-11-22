import type { User, RoleKey } from '@erxes/core-contract';
import { EntityPicker, PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TEAM_MEMBERS_HOTKEY_SCOPE } from '../constants';
import { useRoles } from '../../roles/useRoles';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';

/** Owners pick any role, admins admin or member. */
export const TeamMemberRoleSelect = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [open, setOpen] = useState(false);
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);
  const { roles, roleName } = useRoles();
  const value = <span className="font-medium">{roleName(user.role)}</span>;

  if (!permissions?.canChangeRole) {
    return <RecordTableInlineCell>{value}</RecordTableInlineCell>;
  }

  const handleRoleChange = (role: RoleKey) => {
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
        <EntityPicker
          items={roles.filter((role) => role.key !== 'owner' || permissions.canGrantOwner)}
          itemKey={(role) => ({ id: role.key, label: role.name })}
          keepOrder
          value={[user.role]}
          onValueChange={([role = user.role]) => handleRoleChange(role)}
          searchPlaceholder={t('search-role')}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
