import {
  IconDots,
  IconLoader2,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import {
  AlertDialog,
  Button,
  DropdownMenu,
  Input,
  Skeleton,
  buttonVariants,
  cn,
  formatDateISOStringToRelativeDateShort,
} from 'erxes-ui';
import { Fragment, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentsThreadActions } from '../hooks/useAgentsThreadActions';
import type { IUseAgentsThreadsResult } from '../hooks/useAgentsThreads';
import type { IAgentsThread } from '../types';

export interface IThreadListProps {
  threadsState: IUseAgentsThreadsResult;
  activeThreadId: string | undefined;
  onSelectThread: (threadId: string) => void;
  onNewConversation: () => void;
  /** Called after a thread has been deleted successfully. */
  onThreadDeleted?: (threadId: string) => void;
}

/** Loading placeholder rows shown while the first page is still in flight. */
const SKELETON_ROWS = 5;

const TITLE_MAX_LENGTH = 120;

type IThreadGroup = {
  key: string;
  label: string;
  icon?: typeof IconPin;
  threads: IAgentsThread[];
};

/**
 * Buckets threads into Today / Yesterday / Previous 7 days / Older so the
 * list scans like a session history instead of one undifferentiated feed.
 */
const groupThreads = (
  threads: IAgentsThread[],
  labels: Record<string, string>,
): IThreadGroup[] => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const buckets = new Map<string, IThreadGroup>(
    (['today', 'yesterday', 'week', 'older'] as const).map((key) => [
      key,
      { key, label: labels[key], threads: [] },
    ]),
  );

  for (const thread of threads) {
    const updatedAt = thread.updatedAt ? new Date(thread.updatedAt) : null;

    if (!updatedAt || Number.isNaN(updatedAt.getTime())) {
      buckets.get('older')?.threads.push(thread);
      continue;
    }

    const time = updatedAt.getTime();

    if (time >= startOfToday) {
      buckets.get('today')?.threads.push(thread);
    } else if (time >= startOfToday - dayMs) {
      buckets.get('yesterday')?.threads.push(thread);
    } else if (time >= startOfToday - 7 * dayMs) {
      buckets.get('week')?.threads.push(thread);
    } else {
      buckets.get('older')?.threads.push(thread);
    }
  }

  return [...buckets.values()].filter((group) => group.threads.length > 0);
};

interface IThreadRowProps {
  thread: IAgentsThread;
  isActive: boolean;
  onSelectThread: (threadId: string) => void;
  onRequestDelete: (threadId: string) => void;
}

/**
 * One thread row: title + relative time, a hover-revealed `IconDots`
 * menu (rename inline, pin/unpin, delete), and an inline `Input` while
 * renaming (Enter saves, Escape/blur cancels). Stays visible on touch
 * layouts where hover is unreliable.
 */
const ThreadRow = ({
  thread,
  isActive,
  onSelectThread,
  onRequestDelete,
}: IThreadRowProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const { rename, setPinned } = useAgentsThreadActions();
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(thread.title ?? '');

  const startRename = () => {
    setDraftTitle(thread.title ?? '');
    setRenaming(true);
  };

  const finishRename = (commit: boolean) => {
    const trimmed = draftTitle.trim();

    setRenaming(false);

    if (
      !commit ||
      !trimmed ||
      trimmed === (thread.title ?? '').trim() ||
      trimmed.length > TITLE_MAX_LENGTH
    ) {
      return;
    }

    void rename(thread.id, trimmed);
  };

  const pinned = thread.pinned === true;

  return (
    <li>
      <div
        className={cn(
          'group relative flex items-center rounded-xl py-2 pl-3.5 pr-1 transition-colors',
          isActive ? 'bg-primary/10' : 'hover:bg-accent/60',
        )}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
            aria-hidden="true"
          />
        )}
        {renaming ? (
          <Input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                finishRename(true);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                finishRename(false);
              }
            }}
            onBlur={() => finishRename(false)}
            maxLength={TITLE_MAX_LENGTH}
            autoFocus
            aria-label={t('rename-conversation', 'Rename conversation')}
            className="h-7 min-w-0 flex-1 px-1.5 text-[13px]"
          />
        ) : (
          <button
            type="button"
            onClick={() => onSelectThread(thread.id)}
            className="min-w-0 flex-1 py-0.5 text-left"
          >
            <span
              className={cn(
                'block truncate text-[13px] leading-tight',
                isActive
                  ? 'font-medium text-foreground'
                  : 'font-normal text-foreground/90',
              )}
            >
              {thread.title || t('untitled', 'Untitled conversation')}
            </span>
            {thread.updatedAt && (
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                {formatDateISOStringToRelativeDateShort(thread.updatedAt)}
              </span>
            )}
          </button>
        )}
        {/* Always visible where there is no reliable hover (touch);
            hover-revealed only on pointer layouts. */}
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 text-muted-foreground transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
              aria-label={t('conversation-actions', 'Conversation actions')}
            >
              <IconDots className="size-3.5" />
            </Button>
          </DropdownMenu.Trigger>
          {/* Keep the freshly-mounted rename input focused — radix would
              otherwise restore focus to the trigger and the input's blur
              would cancel the rename instantly. */}
          <DropdownMenu.Content
            align="start"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenu.Item onSelect={startRename}>
              <IconPencil className="size-4" />
              {t('rename', 'Rename')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => void setPinned(thread.id, !pinned)}
            >
              {pinned ? (
                <IconPinnedOff className="size-4" />
              ) : (
                <IconPin className="size-4" />
              )}
              {pinned ? t('unpin', 'Unpin') : t('pin', 'Pin')}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              className="text-destructive focus:text-destructive"
              onSelect={() => onRequestDelete(thread.id)}
            >
              <IconTrash className="size-4" />
              {t('delete', 'Delete')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
    </li>
  );
};

/**
 * Sidebar list of the user's agents conversations: pinned threads first,
 * then sessions grouped by activity (Today / Yesterday / Previous 7 days /
 * Older), a client-side filter, per-row rename/pin/delete, and "load
 * more" pagination.
 *
 * Memoized: the chat surfaces re-render on every streamed delta, but the
 * thread list only changes when the threads, the active id, or one of the
 * (stable) handlers changes.
 */
const ThreadListBase = ({
  threadsState,
  activeThreadId,
  onSelectThread,
  onNewConversation,
  onThreadDeleted,
}: IThreadListProps) => {
  const {
    threads,
    pinnedThreads,
    loading,
    error,
    loadingMore,
    hasMore,
    loadMore,
  } = threadsState;
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const { remove, busy } = useAgentsThreadActions();
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const filterQuery = filter.trim().toLowerCase();
  const matchesFilter = (thread: IAgentsThread) =>
    (thread.title || 'Untitled conversation')
      .toLowerCase()
      .includes(filterQuery);

  const visibleThreads = useMemo(
    () => (filterQuery ? threads.filter(matchesFilter) : threads),
    [threads, filterQuery],
  );

  const visiblePinned = useMemo(
    () => (filterQuery ? pinnedThreads.filter(matchesFilter) : pinnedThreads),
    [pinnedThreads, filterQuery],
  );

  const groups = useMemo(() => {
    const dateGroups = groupThreads(visibleThreads, {
      today: t('today', 'Today'),
      yesterday: t('yesterday', 'Yesterday'),
      week: t('week', 'Previous 7 days'),
      older: t('older', 'Older'),
    });

    return visiblePinned.length > 0
      ? [
          {
            key: 'pinned',
            label: t('pinned', 'Pinned'),
            icon: IconPin,
            threads: visiblePinned,
          } as IThreadGroup,
          ...dateGroups,
        ]
      : dateGroups;
  }, [visibleThreads, visiblePinned, t]);

  const handleConfirmDelete = () => {
    if (!threadToDelete || busy) {
      return;
    }

    void remove(threadToDelete).then((removed) => {
      if (removed) {
        onThreadDeleted?.(threadToDelete);
        setThreadToDelete(null);
      }
    });
  };

  const empty =
    !loading && !error && threads.length === 0 && pinnedThreads.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 px-3 pb-2 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="px-1 text-xs font-medium text-muted-foreground">
            {t('conversations', 'Conversations')}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onNewConversation}
            aria-label={t('new-conversation', 'New conversation')}
          >
            <IconPlus className="size-3.5" />
            {t('new', 'New')}
          </Button>
        </div>
        <div className="relative">
          <IconSearch className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={t('filter', 'Filter conversations…')}
            aria-label={t('filter', 'Filter conversations')}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-1">
        {loading && threads.length === 0 && pinnedThreads.length === 0 && (
          <div className="space-y-1.5" aria-hidden="true">
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <div
                key={index}
                className="space-y-1.5 rounded-xl px-3 py-2.5"
              >
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {empty && (
          <div className="flex flex-col items-center gap-1.5 px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              {t('no-conversations', 'No conversations yet.')}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 h-7 gap-1 rounded-full px-3 text-xs"
              onClick={onNewConversation}
            >
              <IconPlus className="size-3.5" />
              {t('start-one', 'Start one')}
            </Button>
          </div>
        )}

        {!empty &&
          !error &&
          visibleThreads.length === 0 &&
          visiblePinned.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              {t('no-match', 'No conversations match the filter.')}
            </p>
          )}

        {groups.map((group) => {
          const GroupIcon = group.icon;

          return (
            <Fragment key={group.key}>
              <p className="flex items-center gap-1 px-2.5 pb-1 pt-3 text-xs font-medium text-muted-foreground/80 first:pt-1">
                {GroupIcon ? <GroupIcon className="size-3" /> : null}
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.threads.map((thread) => (
                  <ThreadRow
                    key={thread.id}
                    thread={thread}
                    isActive={thread.id === activeThreadId}
                    onSelectThread={onSelectThread}
                    onRequestDelete={setThreadToDelete}
                  />
                ))}
              </ul>
            </Fragment>
          );
        })}

        {hasMore && (
          <div className="px-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full gap-1.5 text-xs text-muted-foreground"
              disabled={loadingMore}
              onClick={loadMore}
            >
              {loadingMore && (
                <IconLoader2 className="size-3.5 animate-spin" />
              )}
              {t('load-more', 'Load more')}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={threadToDelete !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setThreadToDelete(null);
          }
        }}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>
              {t('delete-title', 'Delete conversation')}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {t(
                'delete-description',
                'This permanently deletes the conversation and its messages.',
              )}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>{t('cancel', 'Cancel')}</AlertDialog.Cancel>
            <AlertDialog.Action
              className={buttonVariants({ variant: 'destructive' })}
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
            >
              {t('delete', 'Delete')}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </div>
  );
};

export const ThreadList = memo(ThreadListBase);
