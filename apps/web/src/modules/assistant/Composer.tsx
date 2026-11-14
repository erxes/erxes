import { IconArrowUp, IconPlayerStopFilled } from '@tabler/icons-react';
import { Button, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { ModelPicker, ThinkingPicker } from './ModelPicker';
import type { ModelRunState } from './useModelRun';

export type ComposerBlock = 'no-key' | 'approval' | 'question' | 'running' | null;

const usePlaceholder = (block: ComposerBlock) => {
  const { t } = useTranslation('assistant');

  switch (block) {
    case 'no-key':
      return t('composer.no-key', 'Add a provider key to start');
    case 'approval':
      return t('composer.approval', 'Approve or decline the change above first');
    case 'question':
      return t('composer.question', 'Answer the questions above first');
    case 'running':
      return t('composer.running', 'A reply is still being written');
    case null:
      return t('composer.placeholder', 'Ask anything about your workspace');
  }
};

const SendButton = ({
  busy,
  canSend,
  onStop,
}: {
  busy: boolean;
  canSend: boolean;
  onStop: () => void;
}) => {
  const { t } = useTranslation('assistant');

  return busy ? (
    <IconTip label={t('composer.stop', 'Stop')}>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label={t('composer.stop', 'Stop')}
        onClick={onStop}
      >
        <IconPlayerStopFilled className="size-3.5" />
      </Button>
    </IconTip>
  ) : (
    <IconTip label={t('composer.send', 'Send')} hotkey="Enter">
      <Button type="submit" size="icon" aria-label={t('composer.send', 'Send')} disabled={!canSend}>
        <IconArrowUp className="size-4" />
      </Button>
    </IconTip>
  );
};

export const Composer = ({
  model,
  busy,
  block,
  onSend,
  onStop,
}: {
  model: ModelRunState;
  busy: boolean;
  block: ComposerBlock;
  onSend: (text: string) => void;
  onStop: () => void;
}) => {
  const { t } = useTranslation('assistant');
  const placeholder = usePlaceholder(block);
  const [text, setText] = useState('');
  const locked = block !== null;
  const canSend = !busy && !locked && text.trim().length > 0;

  const send = () => {
    if (!canSend) return;

    onSend(text.trim());
    setText('');
  };

  return (
    <form
      className="m-3 mt-0 flex flex-col gap-1 rounded-xl border bg-background p-2 shadow-xs focus-within:shadow-focus"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <Textarea
        variant="ghost"
        aria-label={t('composer.label', 'Message')}
        placeholder={placeholder}
        disabled={locked}
        value={text}
        rows={2}
        className="max-h-48 min-h-14 resize-none"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            send();
          }
        }}
      />
      <div className="flex min-w-0 items-center gap-1">
        <ModelPicker state={model} disabled={busy || block === 'no-key'} />
        <ThinkingPicker state={model} disabled={busy} />
        <span className="flex-1" />
        <SendButton busy={busy} canSend={canSend} onStop={onStop} />
      </div>
    </form>
  );
};
