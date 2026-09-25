import { Empty, ScrollArea } from 'erxes-ui';
import { IconMessages } from '@tabler/icons-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { InboxMessagesSkeleton } from '@/inbox/components/InboxMessagesSkeleton';

export const InboxMessagesContainer = ({
  fetchMore,
  messagesLength,
  totalCount,
  loading,
  conversationId,
  children,
}: React.PropsWithChildren<{
  fetchMore: () => unknown;
  messagesLength: number;
  totalCount: number;
  loading: boolean;
  conversationId?: string;
}>) => {
  const { t } = useTranslation('frontline');
  const viewportRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const shouldFollowNewestRef = useRef(true);
  const pendingPaginationRef = useRef<{
    anchor: HTMLElement | null;
    anchorOffset: number;
    distanceFromBottom: number;
    messagesLength: number;
  } | null>(null);
  const isInitialScrollDoneRef = useRef(false);
  const isFetchingRef = useRef(false);
  const fetchGenerationRef = useRef(0);
  const previousConversationIdRef = useRef(conversationId);
  const [completedPagination, setCompletedPagination] = useState(0);

  useLayoutEffect(() => {
    if (previousConversationIdRef.current === conversationId) return;

    previousConversationIdRef.current = conversationId;
    fetchGenerationRef.current += 1;
    isInitialScrollDoneRef.current = false;
    pendingPaginationRef.current = null;
    isFetchingRef.current = false;
    shouldFollowNewestRef.current = true;
  }, [conversationId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    });
  };

  const runFetchMore = useCallback(() => {
    const viewport = viewportRef.current;
    const viewportTop = viewport?.getBoundingClientRect().top ?? 0;
    const anchor = Array.from(messagesRef.current?.children ?? []).find(
      (element) => element.getBoundingClientRect().bottom >= viewportTop,
    ) as HTMLElement | undefined;
    const fetchGeneration = fetchGenerationRef.current;
    isFetchingRef.current = true;
    pendingPaginationRef.current = {
      anchor: anchor ?? null,
      anchorOffset: anchor
        ? anchor.getBoundingClientRect().top - viewportTop
        : 0,
      distanceFromBottom:
        (viewport?.scrollHeight ?? 0) - (viewport?.scrollTop ?? 0),
      messagesLength,
    };

    Promise.resolve()
      .then(() => fetchMore())
      .catch(() => undefined)
      .finally(() => {
        if (fetchGenerationRef.current !== fetchGeneration) return;

        isFetchingRef.current = false;
        setCompletedPagination((value) => value + 1);
      });
  }, [fetchMore, messagesLength]);

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    shouldFollowNewestRef.current = distanceFromBottom < 120;

    if (
      viewport.scrollTop <= 60 &&
      !isFetchingRef.current &&
      isInitialScrollDoneRef.current &&
      messagesLength > 0 &&
      totalCount > messagesLength &&
      viewport.scrollHeight > viewport.clientHeight
    ) {
      runFetchMore();
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (!isInitialScrollDoneRef.current && messagesLength > 0) {
      viewport.scrollTop = viewport.scrollHeight;
      scrollToBottom();
      isInitialScrollDoneRef.current = true;
      return;
    }

    if (
      !pendingPaginationRef.current &&
      messagesLength > 0 &&
      shouldFollowNewestRef.current
    ) {
      scrollToBottom();
    }
  }, [conversationId, loading, messagesLength]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const pendingPagination = pendingPaginationRef.current;

    if (!viewport || !pendingPagination || isFetchingRef.current) return;

    if (messagesLength > pendingPagination.messagesLength) {
      if (pendingPagination.anchor?.isConnected) {
        const currentAnchorOffset =
          pendingPagination.anchor.getBoundingClientRect().top -
          viewport.getBoundingClientRect().top;
        viewport.scrollTop +=
          currentAnchorOffset - pendingPagination.anchorOffset;
      } else {
        viewport.scrollTop =
          viewport.scrollHeight - pendingPagination.distanceFromBottom;
      }
    }

    pendingPaginationRef.current = null;
  }, [completedPagination, messagesLength]);

  useEffect(() => {
    if (
      loading ||
      !isInitialScrollDoneRef.current ||
      isFetchingRef.current ||
      messagesLength === 0 ||
      totalCount <= messagesLength
    ) {
      return;
    }

    const viewport = viewportRef.current;
    if (viewport && viewport.scrollHeight <= viewport.clientHeight) {
      runFetchMore();
    }
  }, [conversationId, loading, messagesLength, runFetchMore, totalCount]);

  return (
    <ScrollArea.Root className="h-full bg-muted/20">
      <ScrollArea.Viewport
        ref={viewportRef}
        className="h-full"
        onScroll={handleScroll}
      >
        {!loading && totalCount === 0 ? (
          <Empty className="min-h-full rounded-none border-0">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconMessages />
              </Empty.Media>
              <Empty.Title>
                {t('no-messages-yet', 'No messages yet', {
                  defaultValue: 'No messages yet',
                })}
              </Empty.Title>
              <Empty.Description>
                {t(
                  'start-conversation-description',
                  'Write a message below to start the conversation.',
                  {
                    defaultValue:
                      'Write a message below to start the conversation.',
                  },
                )}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        ) : (
          <div
            ref={messagesRef}
            className="mx-auto flex w-full max-w-[720px] min-w-0 flex-col overflow-x-hidden px-3 py-6 sm:px-4 md:px-6"
          >
            {children}
          </div>
        )}
        <InboxMessagesSkeleton isFetched={!loading} />
      </ScrollArea.Viewport>
      <ScrollArea.Bar orientation="vertical" />
      <ScrollArea.Bar orientation="horizontal" />
    </ScrollArea.Root>
  );
};
