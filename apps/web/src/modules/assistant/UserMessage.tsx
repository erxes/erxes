import { AssistantMentions } from '@erxes/core-contract';
import { IconInfoCircle, IconPencil } from '@tabler/icons-react';
import type { UIMessage } from 'ai';
import { Button, Textarea } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { CopyButton, textOf } from './CopyButton';
import { MessageAttachments } from './MessageAttachments';
import { MessageText } from './MessageText';

const mentionsOf = (message: UIMessage) =>
  message.parts.flatMap((part) =>
    part.type === 'data-mentions'
      ? (AssistantMentions.safeParse(part.data).data?.mentions ?? [])
      : [],
  );

const EditForm = ({
  text,
  onCancel,
  onSend,
}: {
  text: string;
  onCancel: () => void;
  onSend: (text: string) => void;
}) => {
  const { t } = useTranslation('assistant');
  const [draft, setDraft] = useState(text);
  const field = useRef<HTMLTextAreaElement>(null);
  const ready = draft.trim().length > 0 && draft.trim() !== text;

  useEffect(() => field.current?.focus(), []);

  const send = () => {
    if (ready) onSend(draft.trim());
  };

  return (
    <form
      aria-label={t('edit.label', 'Edit your message')}
      className="flex flex-col gap-2 rounded-xl border bg-background p-2"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <Textarea
        variant="ghost"
        aria-label={t('edit.text', 'Message')}
        ref={field}
        value={draft}
        rows={2}
        className="max-h-48 min-h-14 resize-none"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onCancel();

          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            send();
          }
        }}
      />
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <IconInfoCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {t(
          'edit.note',
          'Sending replaces this message and the replies after it. Changes the assistant already made in your workspace stay.',
        )}
      </p>
      <div className="flex justify-end gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t('edit.cancel', 'Cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={!ready}>
          {t('edit.send', 'Send')}
        </Button>
      </div>
    </form>
  );
};

export const UserMessage = ({
  message,
  onEdit,
}: {
  message: UIMessage;
  onEdit: ((text: string) => void) | null;
}) => {
  const { t } = useTranslation('assistant');
  const [editing, setEditing] = useState(false);
  const text = textOf(message);

  if (editing && onEdit) {
    return (
      <EditForm
        text={text}
        onCancel={() => setEditing(false)}
        onSend={(next) => {
          setEditing(false);
          onEdit(next);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <MessageAttachments message={message} />
      {text && (
        <div className="group flex w-full items-start justify-end gap-1">
          <div className="flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            {onEdit && (
              <IconTip label={t('edit.start', 'Edit')}>
                <Button
                  variant="ghost"
                  size="icon"
                  tone="muted"
                  aria-label={t('edit.start', 'Edit')}
                  onClick={() => setEditing(true)}
                >
                  <IconPencil className="size-3.5" />
                </Button>
              </IconTip>
            )}
            <CopyButton text={text} />
          </div>
          <p className="max-w-5/6 rounded-xl rounded-br-sm bg-accent px-3 py-2 text-sm whitespace-pre-wrap break-words">
            <MessageText text={text} mentions={mentionsOf(message)} />
          </p>
        </div>
      )}
    </div>
  );
};
