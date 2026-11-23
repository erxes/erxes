import type { AssistantThread, CursorQuery } from '@erxes/core-contract';
import { IconHistory, IconMessage, IconPin } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { isToday, isYesterday, subDays } from 'date-fns';
import { Button, Command, Spinner, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { orpc } from '@erxes/core-contract/client';
import { forwardPaging } from '~/lib/cursorList';
import { liveOptions } from '~/lib/live';
import { threadTitle } from './useThread';

const PAGE = 50;

type Period = 'pinned' | 'today' | 'yesterday' | 'week' | 'older';

const PERIODS: Period[] = ['pinned', 'today', 'yesterday', 'week', 'older'];

const periodOf = (thread: AssistantThread): Period => {
  const updated = new Date(thread.updatedAt);

  if (thread.pinned) return 'pinned';

  if (isToday(updated)) return 'today';

  if (isYesterday(updated)) return 'yesterday';

  return updated > subDays(new Date(), 7) ? 'week' : 'older';
};

const useThreadPages = () =>
  useInfiniteQuery(
    orpc.assistant.threads.infiniteOptions({
      input: (page: CursorQuery) => page,
      ...forwardPaging(PAGE),
      ...liveOptions(['assistant'], false),
    }),
  );

const ThreadItem = ({ thread, onOpen }: { thread: AssistantThread; onOpen: () => void }) => {
  const { t } = useTranslation('assistant');
  const format = useFormat();
  const title = threadTitle(thread, t);
  const Icon = thread.pinned ? IconPin : IconMessage;

  return (
    <Command.Item value={`${title} ${thread.id}`} onSelect={onOpen}>
      <Icon aria-hidden className="text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <time dateTime={thread.updatedAt} className="shrink-0 text-xs text-muted-foreground">
        {format.date(thread.updatedAt, 'MMM d')}
      </time>
    </Command.Item>
  );
};

export const HistoryList = ({ onOpen }: { onOpen: (id: string) => void }) => {
  const { t } = useTranslation('assistant');
  const query = useThreadPages();
  const threads = query.data?.pages.flatMap((page) => page.data) ?? [];

  const headings: Record<Period, string> = {
    pinned: t('history-group.pinned', 'Pinned'),
    today: t('history-group.today', 'Today'),
    yesterday: t('history-group.yesterday', 'Yesterday'),
    week: t('history-group.week', 'Last 7 days'),
    older: t('history-group.older', 'Older'),
  };

  if (query.isPending) return <Spinner size="sm" className="my-6" />;

  if (query.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-2 py-6 text-sm">
        <p className="text-muted-foreground">
          {t('history-failed', 'Could not load your conversations.')}
        </p>
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          {t('retry', 'Try again')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Command.Empty>
        {threads.length
          ? t('no-match', 'No conversation matches.')
          : t('no-history', 'No conversations yet.')}
      </Command.Empty>
      {PERIODS.map((period) => {
        const group = threads.filter((thread) => periodOf(thread) === period);

        return group.length ? (
          <Command.Group key={period} heading={headings[period]}>
            {group.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} onOpen={() => onOpen(thread.id)} />
            ))}
          </Command.Group>
        ) : null;
      })}
      {query.hasNextPage && (
        <Command.Group>
          <Command.Item
            forceMount
            value="load-more"
            disabled={query.isFetchingNextPage}
            onSelect={() => void query.fetchNextPage()}
          >
            <IconHistory aria-hidden className="text-muted-foreground" />
            {t('load-more', 'Show older conversations')}
          </Command.Item>
        </Command.Group>
      )}
    </>
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

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('history', 'Conversations')}
      description={t(
        'history-description',
        'Find a conversation by its title. Pinned ones come first.',
      )}
      className="sm:max-w-lg"
    >
      <Command.Input placeholder={t('search-history', 'Search conversations')} />
      <Command.List className="max-h-96">{open && <HistoryList onOpen={onOpen} />}</Command.List>
    </Command.Dialog>
  );
};
