import type {
  AssistantAttachment,
  AssistantMention,
  AssistantPage,
  AssistantSelection,
} from '@erxes/core-contract';
import { IconArrowUp, IconPlayerStopFilled } from '@tabler/icons-react';
import { Button, Textarea } from 'erxes-ui';
import { type ClipboardEvent, type DragEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { AttachButton, AttachmentTray, PickButton, PickHint } from './ComposerAttachments';
import { MENTION_MENU_ID, MentionMenu } from './MentionMenu';
import { ModelPicker, ThinkingPicker } from './ModelPicker';
import { PageContextChip } from './PageContextChip';
import { useAttachments } from './useAttachments';
import { useComposerMentions } from './useComposerMentions';
import type { ModelRunState } from './useModelRun';
import { usePagePicker } from './usePagePicker';

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
  files: AssistantAttachment[];
  selections: AssistantSelection[];
}

const filesOf = (transfer: DataTransfer) => [...transfer.files];

const useDraft = (
  canSend: boolean,
  page: AssistantPage | null,
  onSend: (message: ComposerMessage) => void,
) => {
  const [text, setText] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mentions = useComposerMentions({ body: text, setBody: setText, textarea });
  const attachments = useAttachments();
  const picker = usePagePicker();
  const { files } = attachments;
  const { selections } = picker;
  const settled = !attachments.uploading && !picker.capturing;
  const hasContent = text.trim().length > 0 || files.length > 0 || selections.length > 0;
  const ready = canSend && settled && hasContent;

  const send = () => {
    if (!ready) return;

    const message = text.trim();

    onSend({ text: message, mentions: mentions.inText(message), page, files, selections });
    setText('');
    mentions.reset();
    attachments.clear();
    picker.clear();
  };

  return { text, setText, textarea, mentions, attachments, picker, ready, send };
};

const useFileDrop = (add: (files: File[]) => void, enabled: boolean) => {
  const [over, setOver] = useState(false);

  return {
    over,
    onDragOver: (event: DragEvent) => {
      if (!enabled || !event.dataTransfer.types.includes('Files')) return;

      event.preventDefault();
      setOver(true);
    },
    onDragLeave: (event: DragEvent) => {
      const into = event.relatedTarget;

      if (!(into instanceof Node && event.currentTarget.contains(into))) setOver(false);
    },
    onDrop: (event: DragEvent) => {
      setOver(false);

      if (!enabled || !event.dataTransfer.files.length) return;

      event.preventDefault();
      add(filesOf(event.dataTransfer));
    },
    onPaste: (event: ClipboardEvent) => {
      if (!enabled || !event.clipboardData.files.length) return;

      event.preventDefault();
      add(filesOf(event.clipboardData));
    },
  };
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
  const draft = useDraft(!busy && !locked, page, onSend);
  const { mentions, textarea } = draft;
  const { onPaste, over, ...drop } = useFileDrop(draft.attachments.add, !locked);
  const listed = mentions.open && mentions.options.length > 0;

  return (
    <form
      {...drop}
      data-dropping={over || undefined}
      className="relative m-3 mt-0 flex flex-col gap-1 rounded-xl border bg-background p-2 shadow-xs focus-within:shadow-focus data-dropping:border-primary"
      onSubmit={(event) => {
        event.preventDefault();
        draft.send();
      }}
    >
      <MentionMenu mentions={mentions} />
      {page && <PageContextChip page={page} onRemove={onHidePage} />}
      <PickHint picker={draft.picker} />
      <AttachmentTray attachments={draft.attachments} picker={draft.picker} />
      <Textarea
        ref={textarea}
        variant="ghost"
        aria-label={t('composer.label', 'Message')}
        aria-autocomplete="list"
        aria-controls={listed ? MENTION_MENU_ID : undefined}
        aria-activedescendant={listed ? `${MENTION_MENU_ID}-${mentions.highlight}` : undefined}
        placeholder={over ? t('attach.drop', 'Drop files to attach them') : placeholder}
        disabled={locked}
        value={draft.text}
        rows={2}
        className="max-h-48 min-h-14 resize-none"
        onPaste={onPaste}
        onChange={(event) => {
          draft.setText(event.target.value);
          mentions.onType(event.target.value, event.target.selectionStart);
        }}
        onBlur={() => setTimeout(mentions.close, 150)}
        onKeyDown={(event) => {
          if (mentions.onKeyDown(event)) return;

          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            draft.send();
          }
        }}
      />
      <div className="flex min-w-0 items-center gap-1">
        <AttachButton attachments={draft.attachments} disabled={locked} />
        <PickButton picker={draft.picker} disabled={locked} />
        <ModelPicker state={model} disabled={busy || block === 'no-key'} />
        <ThinkingPicker state={model} disabled={busy} />
        <span className="flex-1" />
        <SendButton busy={busy} canSend={draft.ready} onStop={onStop} />
      </div>
    </form>
  );
};
