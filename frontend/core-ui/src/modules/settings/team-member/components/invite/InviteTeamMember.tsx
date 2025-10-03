import { IconPlus, IconUsersGroup, IconX } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { InviteForm } from '@/settings/team-member/components/invite/InviteForm';

export function InviteTeamMember() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Invite team members
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md xl:max-w-lg p-0">
        <Dialog.Header className="px-3 py-[13px] border-b border-muted">
          <Dialog.Title className="flex items-center gap-2 text-sm">
            <IconUsersGroup size={14} />
            Invite team members
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Add a new account
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-0"
            >
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>
        <div className="flex flex-col gap-6 px-3 pb-3">
          <span className="text-accent-foreground">
            Send an email and notify members that they've been invited!
          </span>
          <InviteForm setIsOpen={setIsOpen} />
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
