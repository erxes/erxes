import type { Activity, Note } from '@erxes/core-contract';
import {
  IconDots,
  IconPaperclip,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconX,
} from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Button, cn, DropdownMenu, memberName, Skeleton, useConfirm } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Lookups } from '~/components/ChangeList';
import { UserAvatar } from '~/components/UserAvatar';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan, useSession } from '~/modules/auth/session';
import { NoteComposer } from './NoteComposer';
import { When } from './timelineTime';
import { NoteHistory, Reactions } from './TimelineExtras';
import { useNoteActions } from './useActivities';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The note's text cut into plain runs and @mentions, each with where it starts. */
const segments = (body: string, mentions: string[]) => {
  if (!mentions.length) return [{ at: 0, text: body, mention: false }];

  const pattern = new RegExp(mentions.map(escapeRegExp).join('|'), 'g');
  const parts: { at: number; text: string; mention: boolean }[] = [];
  let at = 0;

  for (const match of body.matchAll(pattern)) {
    if (match.index > at) parts.push({ at, text: body.slice(at, match.index), mention: false });
    parts.push({ at: match.index, text: match[0], mention: true });
    at = match.index + match[0].length;
  }

  if (at < body.length) parts.push({ at, text: body.slice(at), mention: false });

  return parts;
};

const NoteFiles = ({ fileIds }: { fileIds: string[] }) => {
  const files = useQuery(
    orpc.files.list.queryOptions({
      input: fileIds.length > 0 ? { ids: fileIds.toSorted().join(',') } : skipToken,
      select: (page) => page.data,
    }),
  );

  if (!fileIds.length) return null;

  if (files.isError) {
    return (
      <p role="alert" className="mt-2 text-xs text-destructive">
        {messageOf(files.error)}
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {files.isPending && <Skeleton className="h-6 w-32" />}
      {files.data?.map((file) => (
        <a
          key={file.id}
          href={`${file.url}?download=1`}
          className="flex h-6 items-center gap-1 rounded border bg-background px-2 text-xs hover:bg-accent"
        >
          <IconPaperclip className="size-3" />
          <span className="max-w-48 truncate">{file.name}</span>
        </a>
      ))}
    </div>
  );
};

/** A note's text with @mentions highlighted, and its attachments. */
const NoteBody = ({ note, lookups }: { note: Note; lookups: Lookups }) => {
  const names = note.mentions.flatMap((id) => {
    const member = lookups.members.get(id);

    return member ? [`@${memberName(member)}`] : [];
  });

  return (
    <div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {segments(note.body, names).map((part) =>
          part.mention ? (
            <span
              key={part.at}
              className="rounded bg-primary/10 px-0.5 font-medium text-primary-text"
            >
              {part.text}
            </span>
          ) : (
            <span key={part.at}>{part.text}</span>
          ),
        )}
      </p>
      <NoteFiles fileIds={note.fileIds} />
    </div>
  );
};

/** Pin, edit (author) and delete (author, owners, admins) a note. */
const NoteActions = ({
  activity,
  note,
  onEdit,
}: {
  activity: Activity;
  note: Note;
  onEdit: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { user } = useSession();
  const { pin, remove } = useNoteActions();
  const { confirm } = useConfirm();
  const mine = activity.actorType === 'user' && activity.actorId === user.id;
  const pinned = note.pinnedAt !== null;
  const manager = useCan()('notes.moderate');

  const onDelete = async () => {
    await confirm({ message: t('delete-note-confirm', 'Delete this note?') });
    remove.mutate({ id: activity.id });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            tone="muted"
            className="size-6 opacity-0 group-hover/note:opacity-100 data-popup-open:opacity-100"
            aria-label={t('note-actions', 'Note actions')}
          />
        }
      >
        <IconDots className="size-3.5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onClick={() => pin.mutate({ id: activity.id, pinned: !pinned })}>
          {pinned ? <IconPinnedOff /> : <IconPin />}
          {pinned ? t('unpin', 'Unpin') : t('pin', 'Pin to top')}
        </DropdownMenu.Item>
        {mine && (
          <DropdownMenu.Item onClick={onEdit}>
            <IconPencil />
            {t('edit', 'Edit')}
          </DropdownMenu.Item>
        )}
        {(mine || manager) && (
          <DropdownMenu.Item variant="destructive" onClick={() => void onDelete()}>
            <IconX />
            {t('delete', 'Delete')}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/** The note's text, or the composer while its author edits it. */
const NoteContent = ({
  activity,
  note,
  lookups,
  editing,
  onEditDone,
}: {
  activity: Activity;
  note: Note;
  lookups: Lookups;
  editing: boolean;
  onEditDone: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { edit } = useNoteActions();

  if (!editing) return <NoteBody note={note} lookups={lookups} />;

  return (
    <div className="mt-1">
      <NoteComposer
        initial={note}
        submitLabel={t('save', 'Save')}
        saving={edit.isPending}
        focusOnMount
        onCancel={onEditDone}
        onSubmit={async (draft) => {
          await edit.mutateAsync({ id: activity.id, ...draft });
          onEditDone();
        }}
      />
    </div>
  );
};

/** A note on the timeline: who wrote it and when, the text, its files and reactions; actions on hover. */
export const NoteItem = ({
  activity,
  note,
  lookups,
  actor,
  heading,
  rail,
  withDate,
}: {
  activity: Activity;
  note: Note;
  lookups: Lookups;
  actor: string;
  /** The author's name, and where the note is when it is on another record. */
  heading: ReactNode;
  rail: ReactNode;
  withDate: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const [editing, setEditing] = useState(false);

  const hasReactions = Object.keys(activity.reactions).length > 0;

  return (
    <li className="group/note relative flex gap-3 pb-5">
      {rail}
      <UserAvatar
        name={actor}
        src={activity.actorAvatarUrl ?? undefined}
        corners="circle"
        ring="lg"
        size="sm"
        className="relative z-1 size-6 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex h-6 min-w-0 items-center gap-1.5 text-sm">
          {heading}
          <When iso={activity.occurredAt} withDate={withDate} />
          {note.editedAt && <NoteHistory noteId={activity.id} />}
          <span className="ml-auto flex shrink-0 items-center gap-0.5">
            {note.pinnedAt && !withDate && (
              <IconPin
                className="size-3.5 text-muted-foreground"
                aria-label={t('pinned', 'Pinned')}
              />
            )}
            {!editing && (
              <NoteActions activity={activity} note={note} onEdit={() => setEditing(true)} />
            )}
          </span>
        </div>
        <div className="mt-1 text-foreground">
          <NoteContent
            activity={activity}
            note={note}
            lookups={lookups}
            editing={editing}
            onEditDone={() => setEditing(false)}
          />
        </div>
        {!editing && (
          <div
            className={cn(
              'mt-1.5 flex',
              !hasReactions &&
                'h-5 -mb-5 opacity-0 transition-opacity group-hover/note:opacity-100 has-[[data-state=open]]:opacity-100',
            )}
          >
            <Reactions activity={activity} />
          </div>
        )}
      </div>
    </li>
  );
};
