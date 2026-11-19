import type { Broadcast } from '@erxes/core-contract';
import { isApiError, orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useBroadcastHandlers } from './broadcastQueries';

/** What the editor changes: the audience and the content. */
export type BroadcastDraft = Pick<
  Broadcast,
  | 'name'
  | 'viewId'
  | 'filter'
  | 'subject'
  | 'preheader'
  | 'body'
  | 'fromName'
  | 'fromEmail'
  | 'replyTo'
>;

const draftOf = ({
  name,
  viewId,
  filter,
  subject,
  preheader,
  body,
  fromName,
  fromEmail,
  replyTo,
}: Broadcast): BroadcastDraft => ({
  name,
  viewId,
  filter,
  subject,
  preheader,
  body,
  fromName,
  fromEmail,
  replyTo,
});

const blankToNull = (value: string | null) => (value?.trim() ? value.trim() : null);

/**
 * The editor's copy of a broadcast, saved on demand. `ensureSaved` saves unsaved changes first,
 * so sending or testing always uses what the member sees.
 */
export const useBroadcastDraft = (broadcast: Broadcast) => {
  const [draft, setDraft] = useState(() => draftOf(broadcast));
  const [dirty, setDirty] = useState(false);
  const handlers = useBroadcastHandlers();

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

  const save = () =>
    update.mutateAsync({
      id: broadcast.id,
      ...draft,
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
