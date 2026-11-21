import type { Broadcast } from '@erxes/core-contract';
import { IconSparkles } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  assistantAskState,
  assistantOpenState,
  newChatAction,
} from '~/modules/assistant/assistantState';
import { useCan } from '~/modules/auth/session';

/**
 * Opens the assistant on a new chat about this draft, after `prepare` saves the editor's
 * changes so the assistant reads what the member sees. The assistant writes; the member sends.
 */
export const DraftWithAssistant = ({
  broadcast,
  prepare,
}: {
  broadcast: Broadcast;
  prepare: () => Promise<void>;
}) => {
  const { t } = useTranslation('broadcasts');
  const allowed = useCan()('assistant.chat');
  const setAsk = useSetAtom(assistantAskState);
  const setOpen = useSetAtom(assistantOpenState);
  const newChat = useSetAtom(newChatAction);

  if (!allowed || broadcast.status !== 'draft') return null;

  const ask = async () => {
    try {
      await prepare();
    } catch {
      // The save's own error shows.
      return;
    }

    newChat();
    setAsk(
      t(
        'assistant-request',
        'Help me draft the {{channel}} broadcast “{{name}}” (id {{id}}). Read it, then ask me what it should say and who it is for.',
        { channel: broadcast.channel, name: broadcast.name, id: broadcast.id },
      ),
    );
    setOpen(true);
  };

  return (
    <Button variant="outline" onClick={() => void ask()}>
      <IconSparkles />
      {t('draft-with-assistant', 'Draft with assistant')}
    </Button>
  );
};
