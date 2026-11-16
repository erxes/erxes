import { IconSparkles } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { assistantAskState, assistantOpenState, newChatAction } from './assistantState';

export const AskAssistantGroup = ({ text, onDone }: { text: string; onDone: () => void }) => {
  const { t } = useTranslation('assistant');
  const allowed = useCan()('assistant.chat');
  const setAsk = useSetAtom(assistantAskState);
  const setOpen = useSetAtom(assistantOpenState);
  const newChat = useSetAtom(newChatAction);
  const question = text.trim();

  if (!allowed || !question) return null;

  return (
    <Command.Group heading={t('title', 'Assistant')}>
      <Command.Item
        value={`assistant:${question}`}
        onSelect={() => {
          newChat();
          setAsk(question);
          setOpen(true);
          onDone();
        }}
      >
        <IconSparkles className="text-muted-foreground" />
        <span className="truncate">
          {t('search.ask', 'Ask the assistant: “{{question}}”', { question })}
        </span>
      </Command.Item>
    </Command.Group>
  );
};
