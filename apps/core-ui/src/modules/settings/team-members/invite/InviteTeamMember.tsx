import { IconPlus, IconUsersGroup, IconX } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InviteForm } from './InviteForm';

export function InviteTeamMember() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          {t('invite-team-members')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md xl:max-w-lg p-0">
        <Dialog.Header className="px-3 py-[13px] border-b border-muted">
          <Dialog.Title className="flex items-center gap-2 text-sm">
            <IconUsersGroup size={14} />
            {t('invite-team-members')}
          </Dialog.Title>
          <Dialog.Description className="sr-only">{t('add-new-account')}</Dialog.Description>
          <Dialog.Close asChild>
            <Button variant="secondary" size="icon" className="absolute right-2 top-2">
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>
        <div className="flex flex-col gap-6 px-3 pb-3">
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
