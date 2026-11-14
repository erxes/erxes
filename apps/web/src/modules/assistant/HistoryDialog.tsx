import type { AssistantThread } from '@erxes/core-contract';
import { IconLoader2, IconPin, IconSearch } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Dialog, InputGroup, ScrollArea, useFormat } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { orpc } from '@erxes/core-contract/client';
import { type CursorParams, forwardPaging } from '~/lib/cursorList';

const PAGE = 50;

const useThreadPages = () =>
  useInfiniteQuery(
    orpc.assistant.threads.infiniteOptions({
      input: (page: CursorParams) => page,
      ...forwardPaging(PAGE),
    }),
  );

const ThreadRow = ({ thread, onOpen }: { thread: AssistantThread; onOpen: () => void }) => {
  const { t } = useTranslation('assistant');
  const format = useFormat();
  const title = thread.title ?? t('untitled', 'Untitled conversation');

  return (
    <li>
      <button
        type="button"
        aria-label={title}
        onClick={onOpen}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-accent focus-visible:shadow-focus"
      >
        {thread.pinned && (
          <IconPin aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {thread.running && <IconLoader2 aria-hidden className="size-3.5 animate-spin" />}
        <time dateTime={thread.updatedAt} className="shrink-0 text-xs text-muted-foreground">
          {format.date(thread.updatedAt, 'MMM d')}
        </time>
      </button>
    </li>
  );
};

const HistoryList = ({ search, onOpen }: { search: string; onOpen: (id: string) => void }) => {
  const { t } = useTranslation('assistant');
  const query = useThreadPages();
  const needle = search.trim().toLowerCase();

  return (
    <QueryState query={query}>
      {(data) => {
        const threads = data.pages
          .flatMap((page) => page.data)
          .filter((thread) => !needle || (thread.title ?? '').toLowerCase().includes(needle))
          .toSorted((a, b) => Number(b.pinned) - Number(a.pinned));

        return (
          <>
            {threads.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                {needle
                  ? t('no-match', 'No conversation matches.')
                  : t('no-history', 'No conversations yet.')}
              </p>
            ) : (
              <ul className="flex flex-col">
                {threads.map((thread) => (
                  <ThreadRow key={thread.id} thread={thread} onOpen={() => onOpen(thread.id)} />
                ))}
              </ul>
            )}
            {query.hasNextPage && (
              <Button
                variant="ghost"
                className="mt-1 w-full"
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                {t('load-more', 'Show older conversations')}
              </Button>
            )}
          </>
        );
      }}
    </QueryState>
  );
};

export const HistoryDialog = ({
  open,
  onOpenChange,
  onOpen,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: (threadId: string) => void;
}) => {
  const { t } = useTranslation('assistant');
  const [search, setSearch] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.HeaderCombined
          title={t('history', 'Conversations')}
          description={t(
            'history-description',
            'Closing a tab keeps its conversation here. Pinned ones come first.',
          )}
        />
        <InputGroup>
          <InputGroup.Addon>
            <IconSearch className="size-4" />
          </InputGroup.Addon>
          <InputGroup.Input
            type="search"
            aria-label={t('search-history', 'Search conversations')}
            placeholder={t('search-history', 'Search conversations')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        <ScrollArea className="max-h-96">
          {open && <HistoryList search={search} onOpen={onOpen} />}
        </ScrollArea>
      </Dialog.Content>
    </Dialog>
  );
};
