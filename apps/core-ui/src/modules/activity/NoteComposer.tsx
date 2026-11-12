import type { User } from '@erxes/core-contract';
import { IconCommand, IconCornerDownLeft } from '@tabler/icons-react';
import { Button, cn, Spinner, Textarea } from 'erxes-ui';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '~/components/UserAvatar';
import { memberName } from '~/lib/members';
import { AttachButton, AttachedFiles, useAttachments } from './NoteAttachments';
import { useMentions } from './useMentions';

/** ⌘ on Apple keyboards, Ctrl elsewhere (the shortcut accepts both). */
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

export interface NoteDraft {
  body: string;
  mentions: string[];
  fileIds: string[];
}

const MentionSuggestions = ({
  suggestions,
  highlight,
  onPick,
}: {
  suggestions: User[];
  highlight: number;
  onPick: (member: User) => void;
}) => (
  <div
    className="absolute top-full left-2 z-20 mt-1 w-64 rounded-md border bg-popover p-1 shadow-md"
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- the textarea's mention popup (ARIA combobox); a <select> can't keep the caret in the textarea
    role="listbox"
    tabIndex={-1}
  >
    {suggestions.map((member, index) => (
      <div
        key={member.id}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an option of that popup, picked on mouse down so the textarea keeps focus
        role="option"
        tabIndex={-1}
        aria-selected={index === highlight}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm',
          index === highlight && 'bg-accent',
        )}
        // Mouse down, not click: the textarea keeps focus (and the caret) while picking.
        onMouseDown={(event) => {
          event.preventDefault();
          onPick(member);
        }}
      >
        <UserAvatar name={memberName(member)} src={member.avatarUrl} className="size-5" />
        <span className="truncate">{memberName(member)}</span>
      </div>
    ))}
  </div>
);

const SubmitButton = ({
  label,
  saving,
  disabled,
  onClick,
}: {
  label: string;
  saving: boolean;
  disabled: boolean;
  onClick: () => void;
}) => (
  <Button
    type="button"
    size="sm"
    disabled={disabled}
    onClick={onClick}
    title={`${label} (${IS_MAC ? '⌘' : 'Ctrl'} + Enter)`}
  >
    {saving ? <Spinner size="sm" /> : null}
    {label}
    <kbd className="ml-0.5 hidden h-4 items-center gap-0.5 rounded bg-primary-foreground/20 px-1 font-sans text-[10px] font-normal sm:inline-flex">
      {IS_MAC ? <IconCommand className="size-2.5" /> : 'Ctrl'}
      <IconCornerDownLeft className="size-2.5" />
    </kbd>
  </Button>
);

/**
 * The note being written: its text, mentions and files, and `submit`, which
 * clears a new note once saved. A failed save keeps the draft.
 */
const useNoteDraft = (
  initial: NoteDraft | undefined,
  saving: boolean,
  onSubmit: (draft: NoteDraft) => Promise<unknown>,
) => {
  const [body, setBody] = useState(initial?.body ?? '');
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mentions = useMentions({ body, setBody, initial: initial?.mentions ?? [], textarea });
  const attachments = useAttachments();

  const submit = async () => {
    const text = body.trim();

    if (!text || saving || attachments.uploading) return;

    try {
      await onSubmit({
        body: text,
        mentions: mentions.mentionsIn(text),
        fileIds: attachments.files.map((file) => file.id),
      });
    } catch {
      // The mutation's toast says why; the draft stays to try again.
      return;
    }

    if (!initial) {
      setBody('');
      mentions.reset();
      attachments.reset();
    }
  };

  /** Mention keys first; ⌘/Ctrl + Enter saves. */
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentions.onKeyDown(event)) return;

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  return { body, setBody, textarea, mentions, attachments, submit, onKeyDown };
};

/**
 * Writes or edits a note: `@` suggests teammates (they are notified), the
 * paperclip attaches files. ⌘/Ctrl + Enter saves. A failed save keeps the
 * draft; the caller's mutation says why.
 */
export const NoteComposer = ({
  initial,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
  focusOnMount = false,
}: {
  initial?: NoteDraft;
  submitLabel: string;
  saving: boolean;
  onSubmit: (draft: NoteDraft) => Promise<unknown>;
  onCancel?: () => void;
  /** Editing an existing note: the caret goes into it. */
  focusOnMount?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const draft = useNoteDraft(initial, saving, onSubmit);
  const { body, setBody, textarea, mentions, attachments, submit } = draft;
  // One line until someone writes: the box opens on focus and stays open while it holds something.
  const [active, setActive] = useState(focusOnMount);
  const { files, uploading } = attachments;
  const open = Boolean(initial) || active || Boolean(body) || files.length > 0 || uploading > 0;

  useEffect(() => {
    if (focusOnMount) textarea.current?.focus();
  }, [focusOnMount, textarea]);

  return (
    <div
      className="relative rounded-lg border bg-background transition-[border-color,box-shadow] focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/10"
      onFocus={() => setActive(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActive(false);
      }}
    >
      <Textarea
        ref={textarea}
        value={body}
        rows={open ? 3 : 1}
        aria-label={t('note-placeholder', 'Write a note… type @ to mention a teammate')}
        placeholder={t('note-placeholder', 'Write a note… type @ to mention a teammate')}
        className={cn(
          'min-h-0 resize-none rounded-lg border-0 bg-transparent px-3 py-2 shadow-none focus-visible:shadow-none focus-visible:ring-0',
          // Collapsed: one line, even when the hint is longer than the box (Mongolian).
          !open && !body && 'overflow-hidden text-ellipsis whitespace-nowrap',
        )}
        onChange={(event) => {
          setBody(event.target.value);
          mentions.onType(event.target.value, event.target.selectionStart);
        }}
        onKeyDown={draft.onKeyDown}
        onBlur={() => setTimeout(mentions.close, 150)}
      />
      {mentions.suggestions.length > 0 && (
        <MentionSuggestions
          suggestions={mentions.suggestions}
          highlight={mentions.highlight}
          onPick={mentions.pick}
        />
      )}
      {(files.length > 0 || uploading > 0) && (
        <AttachedFiles files={files} uploading={uploading} onRemove={attachments.remove} />
      )}
      <div className={cn('flex items-center justify-between px-1.5 pb-1.5', !open && 'hidden')}>
        <AttachButton onAttach={attachments.attach} />
        <div className="flex items-center gap-1">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {t('cancel', 'Cancel')}
            </Button>
          )}
          <SubmitButton
            label={submitLabel}
            saving={saving}
            disabled={!body.trim() || saving || uploading > 0}
            onClick={() => void submit()}
          />
        </div>
      </div>
    </div>
  );
};
