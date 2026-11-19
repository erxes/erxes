import { IconArrowUp, IconSparkles } from '@tabler/icons-react';
import { Button, Dialog, Input, Textarea } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { type SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  assistantAskState,
  assistantOpenState,
  newChatAction,
} from '~/modules/assistant/assistantState';
import { useCan } from '~/modules/auth/session';

const useAskAssistant = () => {
  const allowed = useCan()('assistant.chat');
  const setAsk = useSetAtom(assistantAskState);
  const setOpen = useSetAtom(assistantOpenState);
  const newChat = useSetAtom(newChatAction);

  const ask = (text: string) => {
    newChat();
    setAsk(text);
    setOpen(true);
  };

  return allowed ? ask : null;
};

export const AskAssistantBar = ({ disabled }: { disabled?: boolean }) => {
  const { t } = useTranslation('automations');
  const ask = useAskAssistant();
  const [text, setText] = useState('');
  const request = text.trim();

  if (!ask) return null;

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();

    if (!request) return;

    ask(request);
    setText('');
  };

  return (
    <form className="flex shrink-0 items-center gap-2 border-t bg-background p-3" onSubmit={submit}>
      <IconSparkles aria-hidden className="size-4 shrink-0 text-primary-text" />
      <Input
        variant="secondary"
        value={text}
        disabled={disabled}
        aria-label={t('ask-assistant', 'Ask the assistant')}
        placeholder={
          disabled
            ? t('ask-assistant-save-first', 'Save your changes, then ask the assistant')
            : t('ask-assistant-placeholder', 'Ask the assistant to change this automation…')
        }
        onChange={(event) => setText(event.target.value)}
      />
      <Button
        type="submit"
        size="icon"
        disabled={Boolean(disabled) || !request}
        aria-label={t('ask-assistant-send', 'Send to the assistant')}
      >
        <IconArrowUp />
      </Button>
    </form>
  );
};

export const DescribeAutomation = () => {
  const { t } = useTranslation('automations');
  const ask = useAskAssistant();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const request = text.trim();

  if (!ask) return null;

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();

    if (!request) return;

    ask(`Create an automation: ${request}`);
    setText('');
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <IconSparkles />
        {t('describe', 'Describe it')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.HeaderCombined
            title={t('describe-title', 'Tell the assistant what should happen')}
            description={t(
              'describe-description',
              'It builds a draft for you to check. Nothing runs until you turn it on.',
            )}
          />
          <form className="space-y-3" onSubmit={submit}>
            <Textarea
              rows={4}
              value={text}
              aria-label={t('describe-title', 'Tell the assistant what should happen')}
              placeholder={t(
                'describe-placeholder',
                'When a new customer is added, create a task for sales and send a welcome email two days later.',
              )}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!request}>
                <IconSparkles />
                {t('describe-submit', 'Build the draft')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
