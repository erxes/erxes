import { IconPlus } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InviteForm } from './InviteForm';

export function InviteTeamMember() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger render={<Button />}>
        <IconPlus />
        {t('invite-team-members')}
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md xl:max-w-lg">
        <Dialog.HeaderCombined
          title={t('invite-team-members')}
          description={t('add-new-account')}
        />
        <div className="flex flex-col gap-6">
          {/* Core sends no invitation email, so this says what a password does. */}
          <span className="text-accent-foreground">
            {t(
              'invite-password-hint',
              'Members invited with a password can sign in right away; the others stay invited until an admin sets one.',
            )}
          </span>
          <InviteForm setIsOpen={setIsOpen} />
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
