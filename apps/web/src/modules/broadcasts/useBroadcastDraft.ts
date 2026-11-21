import type { Broadcast } from '@erxes/core-contract';
import { isApiError, orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useLeaveWarning } from '~/lib/useLeaveWarning';
import { useBroadcastHandlers } from './broadcastQueries';
import { sameDocument, toEmailDocument } from './emailDocument';

/** What the editor changes: the audience and the content. */
export type BroadcastDraft = Pick<
  Broadcast,
  | 'name'
  | 'viewId'
  | 'filter'
  | 'subject'
  | 'preheader'
  | 'body'
  | 'content'
  | 'fromName'
  | 'replyTo'
  | 'attachmentIds'
>;

const draftOf = ({
  name,
  viewId,
  filter,
  subject,
  preheader,
  body,
  content,
  fromName,
  replyTo,
  attachmentIds,
}: Broadcast): BroadcastDraft => ({
  name,
  viewId,
  filter,
  subject,
  preheader,
  body,
  content,
  fromName,
  replyTo,
  attachmentIds,
});

/**
 * The saved copy, keeping the editor's own document when it says the same: Postgres reorders
 * a stored document's keys, and a new one would reset the email editor's cursor.
 */
const resync = (current: BroadcastDraft, broadcast: Broadcast): BroadcastDraft => {
  const next = draftOf(broadcast);

  return sameDocument(current.content, next.content) ? { ...next, content: current.content } : next;
};

const blankToNull = (value: string | null) => (value?.trim() ? value.trim() : null);

/**
 * The editor's copy of a broadcast, saved on demand. `ensureSaved` saves unsaved changes first,
 * so sending or testing always uses what the member sees.
 */
export const useBroadcastDraft = (broadcast: Broadcast) => {
  const [draft, setDraft] = useState(() => draftOf(broadcast));
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState(broadcast.updatedAt);
  const handlers = useBroadcastHandlers();

  // A change saved elsewhere (the assistant, a teammate) replaces the copy unless the member has
  // unsaved changes of their own.
  if (broadcast.updatedAt !== savedAt && !dirty) {
    setSavedAt(broadcast.updatedAt);
    setDraft((current) => resync(current, broadcast));
  }

  useLeaveWarning(dirty);

  const update = useMutation(
    orpc.broadcasts.update.mutationOptions({
      ...handlers,
      onSuccess: async () => {
        setDirty(false);
        await handlers.onSuccess();
      },
      // An unknown placeholder shows under the copy instead.
      onError: (error) => !isApiError(error, 'UNKNOWN_PLACEHOLDER') && handlers.onError(error),
    }),
  );

  // An SMS says its text; an email sends its document, which core renders.
  const { body, content, ...fields } = draft;

  const save = () =>
    update.mutateAsync({
      id: broadcast.id,
      ...fields,
      ...(broadcast.channel === 'email' ? { content: toEmailDocument(content) } : { body }),
      name: draft.name.trim() || broadcast.name,
      subject: blankToNull(draft.subject),
      preheader: blankToNull(draft.preheader),
      fromName: blankToNull(draft.fromName),
      replyTo: blankToNull(draft.replyTo),
    });

  return {
    draft,
    dirty,
    saving: update.isPending,
    /** The placeholders the server couldn't fill on the last save. */
    unknownPlaceholders: isApiError(update.error, 'UNKNOWN_PLACEHOLDER')
      ? update.error.data.placeholders
      : [],
    change: (patch: Partial<BroadcastDraft>) => {
      setDraft((current) => ({ ...current, ...patch }));
      setDirty(true);
    },
    save,
    ensureSaved: async () => {
      if (dirty) await save();
    },
  };
};
