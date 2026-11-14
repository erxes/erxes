import type { AssistantMention, AssistantPage } from '@erxes/core-contract';
import { IconArrowUp, IconPlayerStopFilled } from '@tabler/icons-react';
import { Button, Textarea } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { MENTION_MENU_ID, MentionMenu } from './MentionMenu';
import { ModelPicker, ThinkingPicker } from './ModelPicker';
import { PageContextChip } from './PageContextChip';
import { useComposerMentions } from './useComposerMentions';
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
      return t('composer.placeholder', 'Ask anything, @ to mention a record');
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

export interface ComposerMessage {
  text: string;
  mentions: AssistantMention[];
  page: AssistantPage | null;
}

const useDraft = (
  canSend: boolean,
  page: AssistantPage | null,
  onSend: (message: ComposerMessage) => void,
) => {
  const [text, setText] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mentions = useComposerMentions({ body: text, setBody: setText, textarea });
  const ready = canSend && text.trim().length > 0;

  const send = () => {
    if (!ready) return;

    const message = text.trim();

    onSend({ text: message, mentions: mentions.inText(message), page });
    setText('');
    mentions.reset();
  };

  return { text, setText, textarea, mentions, ready, send };
};

export const Composer = ({
  model,
  busy,
  block,
  page,
  onHidePage,
  onSend,
  onStop,
}: {
  model: ModelRunState;
  busy: boolean;
  block: ComposerBlock;
  page: AssistantPage | null;
  onHidePage: () => void;
  onSend: (message: ComposerMessage) => void;
  onStop: () => void;
}) => {
  const { t } = useTranslation('assistant');
  const placeholder = usePlaceholder(block);
  const locked = block !== null;

  const { text, setText, textarea, mentions, ready, send } = useDraft(
    !busy && !locked,
    page,
    onSend,
  );

  const listed = mentions.open && mentions.options.length > 0;

  return (
    <form
      className="relative m-3 mt-0 flex flex-col gap-1 rounded-xl border bg-background p-2 shadow-xs focus-within:shadow-focus"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <MentionMenu mentions={mentions} />
      {page && <PageContextChip page={page} onRemove={onHidePage} />}
      <Textarea
        ref={textarea}
        variant="ghost"
        aria-label={t('composer.label', 'Message')}
        aria-autocomplete="list"
        aria-controls={listed ? MENTION_MENU_ID : undefined}
        aria-activedescendant={listed ? `${MENTION_MENU_ID}-${mentions.highlight}` : undefined}
        placeholder={placeholder}
        disabled={locked}
        value={text}
        rows={2}
        className="max-h-48 min-h-14 resize-none"
        onChange={(event) => {
          setText(event.target.value);
          mentions.onType(event.target.value, event.target.selectionStart);
        }}
        onBlur={() => setTimeout(mentions.close, 150)}
        onKeyDown={(event) => {
          if (mentions.onKeyDown(event)) return;

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
        <SendButton busy={busy} canSend={ready} onStop={onStop} />
      </div>
    </form>
  );
};
