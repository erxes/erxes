import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useAtom } from 'jotai';
import { imapFormSheetAtom } from '../states/imapStates';
import { ImapIntegrationFormSheet } from './ImapIntegrationForm';

export const ImapIntegrationFormLayout = () => {
  const [imapFormSheet, setImapFormSheet] = useAtom(imapFormSheetAtom);

  return (
    <div>
      <Sheet open={imapFormSheet} onOpenChange={setImapFormSheet}>
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Add IMAP Integration
          </Button>
        </Sheet.Trigger>
        <Sheet.View>
          <Sheet.Header>
            <Sheet.Title>Add IMAP Integration</Sheet.Title>
            <Sheet.Description>
              Configure your IMAP integration to connect with your email
              accounts and manage conversations.
            </Sheet.Description>
            <Sheet.Close />
          </Sheet.Header>
          <ImapIntegrationFormSheet />
        </Sheet.View>
      </Sheet>
    </div>
  );
};
