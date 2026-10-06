import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { loadMessageTarget } from '@/inbox/conversation-messages/utils/messageNavigation';

const waitForRender = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export const useMessageNavigation = ({
  conversationId,
  messagesLength,
  totalCount,
  loading,
  handleFetchMore,
}: {
  conversationId: string;
  messagesLength: number;
  totalCount: number;
  loading: boolean;
  handleFetchMore: () => Promise<unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const containerRef = useRef<HTMLDivElement>(null);
  const [pendingTarget, setPendingTarget] = useState<{
    conversationId: string;
    messageId: string;
  } | null>(null);
  const latestRef = useRef({
    messagesLength,
    totalCount,
    handleFetchMore,
    loading,
  });

  useLayoutEffect(() => {
    latestRef.current = {
      messagesLength,
      totalCount,
      handleFetchMore,
      loading,
    };
  }, [messagesLength, totalCount, handleFetchMore, loading]);

  const jumpToMessage = useCallback(
    (messageId: string) => setPendingTarget({ conversationId, messageId }),
    [conversationId],
  );

  useEffect(() => {
    const handleJump = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === 'string') {
        jumpToMessage(event.detail);
      }
    };
    window.addEventListener('frontline:jump-to-message', handleJump);
    return () =>
      window.removeEventListener('frontline:jump-to-message', handleJump);
  }, [jumpToMessage]);

  useEffect(() => {
    if (!pendingTarget || pendingTarget.conversationId !== conversationId) {
      return;
    }
    let cancelled = false;
    const escapedId = CSS.escape(pendingTarget.messageId);
    const navigate = async () => {
      while (latestRef.current.loading && !cancelled) await waitForRender();
      return loadMessageTarget({
        findTarget: () =>
          containerRef.current?.querySelector<HTMLElement>(
            `[data-provider-message-id="${escapedId}"], [id="conversation-message-${escapedId}"]`,
          ) || null,
        getMessageCount: () => latestRef.current.messagesLength,
        getTotalCount: () => latestRef.current.totalCount,
        isCancelled: () => cancelled,
        loadMore: async () => {
          while (latestRef.current.loading && !cancelled) await waitForRender();
          if (cancelled) return;
          await latestRef.current.handleFetchMore();
          await waitForRender();
        },
      });
    };
    navigate()
      .then((target) => {
        if (cancelled) return;
        if (!target) {
          setPendingTarget(null);
          toast({
            title: t('message-not-found', 'Message is no longer available'),
          });
          return;
        }
        requestAnimationFrame(() => {
          if (cancelled) return;
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.animate(
            [
              { backgroundColor: 'transparent' },
              { backgroundColor: 'hsl(var(--accent))' },
              { backgroundColor: 'transparent' },
            ],
            { duration: 900 },
          );
          setPendingTarget(null);
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setPendingTarget(null);
        toast({
          title: t('message-navigation-failed', 'Could not load the message'),
          description: error instanceof Error ? error.message : undefined,
          variant: 'destructive',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, pendingTarget, t]);

  return { containerRef, jumpToMessage };
};
