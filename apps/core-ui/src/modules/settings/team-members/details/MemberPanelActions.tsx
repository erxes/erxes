import type { User } from '@erxes/core-contract';
import { IconDots } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemberPermissions } from '../useTeamMembers';
import { TeamMemberActionItems } from './TeamMemberActionItems';

/** The dots menu in a member's header; hidden when there is nothing you may do. */
export const MemberPanelActions = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [menuOpen, setMenuOpen] = useState(false);
  const permissions = useMemberPermissions(user);

  if (!permissions?.canSetPassword && !permissions?.canToggle) return null;

  return (
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
          <TeamMemberActionItems user={user} onAction={() => setMenuOpen(false)} />
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
