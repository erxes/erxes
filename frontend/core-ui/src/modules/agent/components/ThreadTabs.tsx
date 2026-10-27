import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, Skeleton, Tabs, cn } from 'erxes-ui';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { IUseAgentsThreadsResult } from '../hooks/useAgentsThreads';

const NEW_TAB = 'new-conversation';

interface IThreadTabsProps {
  threadsState: IUseAgentsThreadsResult;
  activeThreadId?: string;
  onSelect: (threadId: string) => void;
  onNew: () => void;
  onDelete: (threadId: string) => Promise<boolean>;
  onDeleted: (threadId: string, nextThreadId?: string) => void;
  controls?: ReactNode;
}

/** Stable browser-style sessions: titles may change, positions do not. */
export const ThreadTabs = ({
  threadsState,
  activeThreadId,
  onSelect,
  onNew,
  onDelete,
  onDeleted,
  controls,
}: IThreadTabsProps) => {
  const reduceMotion = useReducedMotion();
  const {
    threads,
    pinnedThreads,
    loading,
    error,
    hasMore,
    loadingMore,
    loadMore,
    refetch,
  } = threadsState;
  const records = new Map(
    [...pinnedThreads, ...threads].map((thread) => [thread.id, thread]),
  );
  const [order, setOrder] = useState<string[]>([]);
  const [deleted, setDeleted] = useState<Set<string>>(() => new Set());
  const [closing, setClosing] = useState<Set<string>>(() => new Set());
  const pending = useRef(new Set<string>());
  const deletedIds = useRef(new Set<string>());
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  useEffect(() => {
    const incoming = [...pinnedThreads, ...threads].map((thread) => thread.id);
    if (activeThreadId) incoming.push(activeThreadId);
    setOrder((previous) => {
      const unseen = incoming.filter(
        (id) => !previous.includes(id) && !deleted.has(id),
      );
      return unseen.length ? [...previous, ...new Set(unseen)] : previous;
    });
  }, [threads, pinnedThreads, activeThreadId, deleted]);

  const ids = order.filter((id) => !deleted.has(id));
  // Include the optimistic first send immediately, before the list subscription.
  if (
    activeThreadId &&
    !ids.includes(activeThreadId) &&
    !deleted.has(activeThreadId)
  )
    ids.push(activeThreadId);
  if (!activeThreadId) ids.push(NEW_TAB);
  const active = activeThreadId ?? NEW_TAB;
  const currentIds = useRef(ids);
  currentIds.current = ids;

  const measure = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const next = {
      left: node.scrollLeft > 1,
      right: node.scrollLeft + node.clientWidth < node.scrollWidth - 1,
    };
    setOverflow((old) =>
      old.left === next.left && old.right === next.right ? old : next,
    );
  }, []);
  const revealActive = useCallback(() => {
    const node = viewport.current;
    const tab = node?.querySelector<HTMLElement>('[data-state="active"]');
    if (node && tab) {
      const tabBounds = tab.getBoundingClientRect();
      const bounds = node.getBoundingClientRect();
      if (tabBounds.left < bounds.left)
        node.scrollLeft -= bounds.left - tabBounds.left;
      else if (tabBounds.right > bounds.right)
        node.scrollLeft += tabBounds.right - bounds.right;
    }
    measure();
  }, [measure]);
  useLayoutEffect(() => {
    revealActive();
    let frame = 0;
    // Scrolling and the overflow state resize the observed nodes; doing it
    // inside the callback would loop the ResizeObserver in one frame.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(revealActive);
    });
    if (viewport.current) observer.observe(viewport.current);
    if (list.current) observer.observe(list.current);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [revealActive]);
  useLayoutEffect(revealActive, [active, order, deleted, revealActive]);

  const close = async (id: string) => {
    if (id === NEW_TAB) {
      onNew();
      return;
    }
    if (pending.current.has(id)) return;
    pending.current.add(id);
    setClosing(new Set(pending.current));
    try {
      if (!(await onDelete(id))) return;
      const remaining = currentIds.current.filter(
        (entry) =>
          entry !== id &&
          !pending.current.has(entry) &&
          !deletedIds.current.has(entry),
      );
      const index = currentIds.current.indexOf(id);
      const next = remaining[Math.min(index, remaining.length - 1)];
      deletedIds.current.add(id);
      setDeleted(new Set(deletedIds.current));
      setOrder((old) => old.filter((entry) => entry !== id));
      onDeleted(id, next === NEW_TAB ? undefined : next);
    } finally {
      pending.current.delete(id);
      setClosing(new Set(pending.current));
    }
  };

  return (
    <div className="shrink-0 border-b bg-sidebar">
      <div className="flex h-11 min-w-0 items-stretch gap-0.5 pl-2 pr-1">
        {(overflow.left || overflow.right) && (
          <Button
            variant="ghost"
            size="icon"
            className="my-auto size-6 shrink-0"
            aria-label="Scroll sessions left"
            disabled={!overflow.left}
            onClick={() =>
              viewport.current?.scrollBy({ left: -240, behavior: 'smooth' })
            }
          >
            <IconChevronLeft className="size-3.5" />
          </Button>
        )}
        <Tabs
          value={active}
          onValueChange={(id) => (id === NEW_TAB ? onNew() : onSelect(id))}
          activationMode="manual"
          className="@container min-w-0 flex-1 overflow-hidden"
        >
          <div
            ref={viewport}
            onScroll={measure}
            className="h-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Tabs.List
              ref={list}
              aria-label="Chat sessions"
              className="flex h-full w-max min-w-full justify-start gap-0 border-0 bg-transparent p-0 pt-1"
            >
              {loading && ids.length === 1 && !activeThreadId && (
                <Skeleton className="mx-1 h-7 w-32 shrink-0" />
              )}
              <AnimatePresence initial={false}>
                {ids.map((id) => {
                  const selected = id === active;
                  const title =
                    id === NEW_TAB
                      ? 'New chat'
                      : records.get(id)?.title || 'Untitled chat';
                  return (
                    <motion.div
                      key={id}
                      layout="position"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 176, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.16,
                        ease: 'easeOut',
                      }}
                      className={cn(
                        'group relative flex h-full w-44 max-w-[100cqw] shrink-0 items-center overflow-hidden rounded-t-lg border border-b-0',
                        selected
                          ? 'border-border bg-background'
                          : 'border-transparent hover:bg-muted/50',
                      )}
                    >
                      <Tabs.Trigger
                        value={id}
                        title={title}
                        disabled={closing.has(id)}
                        className="h-full w-full min-w-0 justify-start rounded-t-lg rounded-b-none py-0 pl-3 pr-9 text-xs font-medium text-muted-foreground after:hidden transition-colors hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:hover:bg-transparent"
                        onKeyDown={(event) => {
                          if (event.key === 'Delete') {
                            event.preventDefault();
                            void close(id);
                          }
                        }}
                      >
                        <span className="truncate">{title}</span>
                      </Tabs.Trigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        tabIndex={-1}
                        className="absolute right-1.5 size-5 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        disabled={closing.has(id)}
                        aria-label={`Close ${title}`}
                        onClick={() => void close(id)}
                      >
                        <IconX
                          className={cn(
                            'size-3.5',
                            closing.has(id) && 'opacity-40',
                          )}
                        />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mx-1 shrink-0 text-xs text-muted-foreground"
                  disabled={loadingMore}
                  onClick={loadMore}
                >
                  {loadingMore ? 'Loading…' : 'More sessions'}
                </Button>
              )}
            </Tabs.List>
          </div>
        </Tabs>
        {(overflow.left || overflow.right) && (
          <Button
            variant="ghost"
            size="icon"
            className="my-auto size-6 shrink-0"
            aria-label="Scroll sessions right"
            disabled={!overflow.right}
            onClick={() =>
              viewport.current?.scrollBy({ left: 240, behavior: 'smooth' })
            }
          >
            <IconChevronRight className="size-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="my-auto size-7 shrink-0"
          aria-label="New chat"
          onClick={onNew}
        >
          <IconPlus className="size-4" />
        </Button>
        <div className="flex shrink-0 items-center">{controls}</div>
      </div>
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-destructive">
          <span className="min-w-0 flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
