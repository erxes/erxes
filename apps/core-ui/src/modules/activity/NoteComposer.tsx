import type { FileInfo, User } from '@erxes/core-contract';
import { IconPaperclip, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, cn, Spinner, Textarea, useToast } from 'erxes-ui';
import { type KeyboardEvent, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '~/components/UserAvatar';
import { api } from '~/lib/api';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { memberName } from '~/lib/members';

export interface NoteDraft {
  body: string;
  mentions: string[];
  fileIds: string[];
}

/** The `@word` being typed at the caret, if any. */
const mentionAt = (text: string, caret: number) => {
  const match = /(^|\s)@([^\s@]{0,30})$/.exec(text.slice(0, caret));

  return match ? { query: match[2]!.toLowerCase(), start: caret - match[2]!.length - 1 } : null;
};

const useActiveMembers = () =>
  useQuery({
    queryKey: ['users', 'mentionable'],
    queryFn: () => api.users.list({ limit: 100, status: 'active' }),
    staleTime: 5 * 60_000,
    select: (page) => page.data,
  });

/**
 * Writes or edits a note: `@` suggests teammates (they are notified), the
 * paperclip attaches files. ⌘/Ctrl + Enter saves.
 */
export const NoteComposer = ({
  initial,
  initialFiles = [],
  submitLabel,
  saving,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  initial?: NoteDraft;
  initialFiles?: FileInfo[];
  submitLabel: string;
  saving: boolean;
  onSubmit: (draft: NoteDraft) => Promise<unknown> | void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { toast } = useToast();
  const [body, setBody] = useState(initial?.body ?? '');
  const [mentions, setMentions] = useState<string[]>(initial?.mentions ?? []);
  const [files, setFiles] = useState<FileInfo[]>(initialFiles);
  const [uploading, setUploading] = useState(0);
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [highlight, setHighlight] = useState(0);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { data: members = [] } = useActiveMembers();

  const suggestions = useMemo(
    () =>
      mention
        ? members
            .filter((member) => `${memberName(member)} ${member.email}`.toLowerCase().includes(mention.query))
            .slice(0, 6)
        : [],
    [members, mention],
  );

  const pick = (member: User) => {
    if (!mention) return;

    const name = memberName(member);
    const caret = textarea.current?.selectionStart ?? body.length;
    const next = `${body.slice(0, mention.start)}@${name} ${body.slice(caret)}`;

    setBody(next);
    setMentions((current) => (current.includes(member.id) ? current : [...current, member.id]));
    setMention(null);
    requestAnimationFrame(() => {
      const position = mention.start + name.length + 2;

      textarea.current?.focus();
      textarea.current?.setSelectionRange(position, position);
    });
  };

  const attach = async (list: FileList | null) => {
    for (const file of Array.from(list ?? [])) {
      setUploading((count) => count + 1);

      try {
        const uploaded = await uploadFile(file);

        setFiles((current) => [...current, uploaded]);
      } catch (error) {
        toast({ variant: 'destructive', title: file.name, description: uploadErrorMessage(error) });
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  const submit = async () => {
    const text = body.trim();

    if (!text || saving || uploading) return;

    // Keep only people still named in the text.
    const named = mentions.filter((id) => {
      const member = members.find((item) => item.id === id);

      return member ? text.includes(`@${memberName(member)}`) : false;
    });

    await onSubmit({ body: text, mentions: named, fileIds: files.map((file) => file.id) });

    if (!initial) {
      setBody('');
      setMentions([]);
      setFiles([]);
    }
  };

  // One line until someone writes: the box opens on focus and stays open while it holds something.
  const [active, setActive] = useState(Boolean(autoFocus));
  const open = Boolean(initial) || active || Boolean(body) || files.length > 0 || uploading > 0;

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlight((index) => (index + (event.key === 'ArrowDown' ? 1 : suggestions.length - 1)) % suggestions.length);
        return;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        pick(suggestions[highlight] ?? suggestions[0]!);
        return;
      }

      if (event.key === 'Escape') {
        setMention(null);
        return;
      }
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div
      className="relative rounded-lg border bg-background transition-shadow focus-within:border-ring/60 focus-within:shadow-sm"
      onFocus={() => setActive(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget as Node | null) && setActive(false)}
    >
      <Textarea
        ref={textarea}
        value={body}
        autoFocus={autoFocus}
        rows={open ? 3 : 1}
        placeholder={t('note-placeholder', 'Write a note… type @ to mention a teammate')}
        className="min-h-0 resize-none border-0 py-2 shadow-none focus-visible:ring-0"
        onChange={(event) => {
          setBody(event.target.value);
          setMention(mentionAt(event.target.value, event.target.selectionStart));
          setHighlight(0);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setMention(null), 150)}
      />
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-2 z-20 mt-1 w-64 rounded-md border bg-popover p-1 shadow-md" role="listbox">
          {suggestions.map((member, index) => (
            <li
              key={member.id}
              role="option"
              aria-selected={index === highlight}
              className={cn('flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm', index === highlight && 'bg-accent')}
              onMouseDown={(event) => {
                event.preventDefault();
                pick(member);
              }}
            >
              <UserAvatar name={memberName(member)} src={member.avatarUrl} className="size-5" />
              <span className="truncate">{memberName(member)}</span>
            </li>
          ))}
        </ul>
      )}
      {(files.length > 0 || uploading > 0) && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
          {files.map((file) => (
            <span key={file.id} className="flex h-6 items-center gap-1 rounded border bg-muted px-2 text-xs">
              <IconPaperclip className="size-3" />
              <span className="max-w-40 truncate">{file.name}</span>
              <button
                type="button"
                aria-label={t('remove-file', 'Remove')}
                onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
              >
                <IconX className="size-3" />
              </button>
            </span>
          ))}
          {uploading > 0 && <Spinner size="sm" />}
        </div>
      )}
      <div className={cn('flex items-center justify-between border-t px-2 py-1', !open && 'hidden')}>
        <input ref={fileInput} type="file" multiple className="hidden" onChange={(event) => void attach(event.target.files).then(() => (event.target.value = ''))} />
        <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={t('attach', 'Attach files')} onClick={() => fileInput.current?.click()}>
          <IconPaperclip className="size-4" />
        </Button>
        <div className="flex items-center gap-1">
          <span className="hidden text-xs text-muted-foreground sm:inline">⌘ ↵</span>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {t('cancel', 'Cancel')}
            </Button>
          )}
          <Button type="button" size="sm" disabled={!body.trim() || saving || uploading > 0} onClick={() => void submit()}>
            {saving ? <Spinner size="sm" /> : null}
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
