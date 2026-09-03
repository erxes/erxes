import { Empty, ScrollArea } from 'erxes-ui';
import { IconMessages } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
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
  fetchMore: () => Promise<unknown>;
  messagesLength: number;
  totalCount: number;
  loading: boolean;
  conversationId?: string;
}>) => {
  const { t } = useTranslation('frontline');
  const viewportRef = useRef<HTMLDivElement>(null);
  const shouldFollowNewestRef = useRef(true);
  const distanceFromBottomRef = useRef(0);
  const isInitialScrollDoneRef = useRef(false);
  const isFetchingRef = useRef(false);
  const prevConversationIdRef = useRef<string | undefined>(conversationId);

  useEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      isInitialScrollDoneRef.current = false;
      distanceFromBottomRef.current = 0;
      isFetchingRef.current = false;
      shouldFollowNewestRef.current = true;
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    });
  };

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
      isFetchingRef.current = true;
      distanceFromBottomRef.current =
        viewport.scrollHeight - viewport.scrollTop;
      fetchMore().finally(() => {
        isFetchingRef.current = false;
      });
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (!isInitialScrollDoneRef.current && messagesLength > 0) {
      viewport.scrollTop = viewport.scrollHeight;
      requestAnimationFrame(() => {
        if (viewportRef.current) {
          viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
      });
      isInitialScrollDoneRef.current = true;
      return;
    }

    if (distanceFromBottomRef.current > 0) {
      viewport.scrollTop =
        viewport.scrollHeight - distanceFromBottomRef.current;
      distanceFromBottomRef.current = 0;
    } else if (messagesLength > 0 && shouldFollowNewestRef.current) {
      scrollToBottom();
    }
  }, [messagesLength, loading, fetchMore]);

  // Auto-fill the viewport: if the loaded messages don't overflow the container
  // there are no scroll events, so handleScroll never fires. Keep fetching older
  // pages until content overflows or all messages are loaded.
  useEffect(() => {
    if (
      !isInitialScrollDoneRef.current ||
      isFetchingRef.current ||
      messagesLength === 0 ||
      totalCount <= messagesLength
    )
      return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    if (viewport.scrollHeight <= viewport.clientHeight) {
      isFetchingRef.current = true;
      distanceFromBottomRef.current =
        viewport.scrollHeight - viewport.scrollTop;
      fetchMore().finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [messagesLength, totalCount, fetchMore]);

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
                {t('no-messages-yet', { defaultValue: 'No messages yet' })}
              </Empty.Title>
              <Empty.Description>
                {t('start-conversation-description', {
                  defaultValue:
                    'Write a message below to start the conversation.',
                })}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        ) : (
          <div className="mx-auto flex w-full max-w-[720px] min-w-0 flex-col overflow-x-hidden px-3 py-6 sm:px-4 md:px-6">
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
