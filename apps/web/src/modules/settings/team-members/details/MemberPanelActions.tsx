import type { User } from '@erxes/core-contract';
import { IconDots } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemberPermissions } from '../useTeamMembers';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { TeamMemberActionItems } from './TeamMemberActionItems';

/** The dots menu in a member's header; hidden when there is nothing you may do. */
export const MemberPanelActions = ({ user }: { user: User }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'team-member' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const permissions = useMemberPermissions(user);

  if (!permissions?.canSetPassword && !permissions?.canToggle) return null;

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t('actions')}
              title={t('actions')}
            />
          }
        >
          <IconDots className="size-4" />
        </Popover.Trigger>
        <Combobox.Content align="end" className="min-w-70">
          <Command>
            <TeamMemberActionItems
              user={user}
              onAction={() => setMenuOpen(false)}
              onResetPassword={() => setResettingPassword(true)}
            />
          </Command>
        </Combobox.Content>
      </Popover>
      <ResetPasswordDialog
        userId={resettingPassword ? user.id : null}
        onClose={() => setResettingPassword(false)}
      />
    </>
  );
};
