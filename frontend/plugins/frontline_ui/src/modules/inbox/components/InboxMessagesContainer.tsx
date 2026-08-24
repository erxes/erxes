import { Empty, ScrollArea } from 'erxes-ui';
import { IconMessages } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { InboxMessagesSkeleton } from './InboxMessagesSkeleton';

export const InboxMessagesContainer = ({
  fetchMore,
  messagesLength,
  totalCount,
  loading,
  children,
}: React.PropsWithChildren<{
  fetchMore: () => void;
  messagesLength: number;
  totalCount: number;
  loading: boolean;
}>) => {
  const { t } = useTranslation('frontline');
  const viewportRef = useRef<HTMLDivElement>(null);

  const [fetchMoreRef] = useInView({
    threshold: 0,
    onChange(inView) {
      if (inView && viewportRef.current) {
        distanceFromBottomRef.current =
          viewportRef.current.scrollHeight - viewportRef.current.scrollTop;
        fetchMore();
      }
    },
  });
  const distanceFromBottomRef = useRef(0);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    });
  };
  useEffect(() => {
    if (viewportRef.current) {
      if (distanceFromBottomRef.current) {
        viewportRef.current.scrollTop =
          viewportRef.current.scrollHeight - distanceFromBottomRef.current;
        distanceFromBottomRef.current = 0;
      } else if (messagesLength > 0) {
        scrollToBottom();
      }
    }
  }, [messagesLength, fetchMore]);

  return (
    <ScrollArea.Root className="h-full bg-muted/20">
      <ScrollArea.Viewport ref={viewportRef} className="h-full">
        {!!messagesLength && totalCount > messagesLength && (
          <p ref={fetchMoreRef} />
        )}
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
          <div className="mx-auto flex w-full max-w-[720px] flex-col px-4 py-6 md:px-6">
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
