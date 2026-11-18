import { applyImmutable } from '@earendil-works/chord/delta';
import type { AssistantWatchEvent } from '@erxes/core-contract';
import {
  experimental_streamedQuery as streamedQuery,
  queryOptions,
  skipToken,
  useQuery,
} from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { orpc } from '@erxes/core-contract/client';

/** How soon to watch again after the server ends a watch: it went idle, or another server runs it. */
const REWATCH_MS = 1500;

type View = Extract<AssistantWatchEvent, { value: unknown }>['value'];

const follow = (view: View | null, event: AssistantWatchEvent) => {
  if ('value' in event) return event.value;

  return view && applyImmutable(view, event.ops);
};

export const threadTitle = (
  thread: { title: string | null } | undefined,
  t: TFunction<'assistant'>,
) => thread?.title ?? t('untitled', 'Untitled conversation');

export const useThread = (threadId: string | null) =>
  useQuery(orpc.assistant.thread.queryOptions({ input: threadId ? { id: threadId } : skipToken }));

/**
 * The conversation as the server commits it: the view, changed by each event, watched again
 * while the panel shows it. Leaving aborts the watch.
 */
export const conversationOptions = (threadId: string | null) =>
  queryOptions({
    queryKey: orpc.assistant.watch.key({ input: { id: threadId ?? '' } }),
    queryFn: threadId
      ? streamedQuery<AssistantWatchEvent, View | null>({
          streamFn: ({ signal }) => orpc.assistant.watch.call({ id: threadId }, { signal }),
          refetchMode: 'append',
          reducer: follow,
          initialValue: null,
        })
      : skipToken,
    refetchInterval: (query) => (query.state.status === 'error' ? false : REWATCH_MS),
    refetchIntervalInBackground: true,
  });
