import { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Button,
  Popover,
  ScrollArea,
  Skeleton,
  readImage,
  toast,
} from 'erxes-ui';
import { IconChevronDown, IconPin, IconPinnedOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CONVERSATION_MESSAGE_PIN } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationMessageReact';
import { useConversationPinnedMessages } from '@/inbox/conversation-messages/hooks/useConversationPinnedMessages';
import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';
import { getProviderMessageId } from '@/inbox/conversation-messages/utils/message';
import { previewOf } from '@/inbox/conversation-messages/utils/messageActionText';
import type { IMessage } from '@/inbox/types/Conversation';

const pinnedImage = (message: IMessage) =>
  message.attachments?.find(({ type }) => type?.startsWith('image'));

export const PinnedMessagesBar = ({
  conversationId,
  onSelectMessage,
}: {
  conversationId: string;
  onSelectMessage: (messageId: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const { messages, loading, error, refetch } =
    useConversationPinnedMessages(conversationId);
  const [unpinMessage, { loading: unpinning }] = useMutation(
    CONVERSATION_MESSAGE_PIN,
    {
      refetchQueries: [
        'FrontlineConversationPinnedMessages',
        'ConversationMessages',
      ],
      awaitRefetchQueries: true,
    },
  );

  const handleUnpin = async (message: IMessage) => {
    const messageId = getProviderMessageId(message);
    if (!messageId || unpinning) return;
    try {
      await unpinMessage({
        variables: { conversationId, messageId, remove: true },
      });
      toast({ title: t('message-unpinned', 'Message unpinned') });
    } catch (unpinError) {
      toast({
        title: t('message-unpin-failed', 'Failed to unpin message'),
        description:
          unpinError instanceof Error ? unpinError.message : undefined,
        variant: 'destructive',
      });
    }
  };

  if (loading && !messages.length) {
    return <Skeleton className="m-2 h-8 shrink-0" />;
  }
  if (error) {
    return (
      <div
        role="alert"
        className="flex shrink-0 items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground"
      >
        {t('pinned-messages-load-failed', 'Could not load pinned messages')}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => refetch().catch(() => undefined)}
        >
          {t('retry', 'Retry')}
        </Button>
      </div>
    );
  }
  if (!messages.length) return null;

  const latestMessage = messages[0];
  const latestImage = pinnedImage(latestMessage);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full shrink-0 justify-start gap-2 rounded-none border-b bg-primary/[0.04] px-4 text-left hover:bg-primary/[0.07]"
        >
          <IconPin className="size-4 shrink-0 text-primary" />
          <span className="shrink-0 text-xs font-medium">
            {t('pinned', 'Pinned')}
            {messages.length > 1 ? ` · ${messages.length}` : ''}
          </span>
          {latestImage && (
            <InboxImage
              src={readImage(latestImage.url)}
              alt={
                latestImage.name || t('pinned-attachment', 'Pinned attachment')
              }
              className="size-6 shrink-0 rounded object-cover"
            />
          )}
          <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted-foreground">
            {previewOf(latestMessage)}
          </span>
          <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="w-[min(26rem,calc(100vw-1rem))] p-0"
      >
        <div className="border-b px-3 py-2 text-xs font-medium">
          {t('pinned-messages', 'Pinned messages')}
        </div>
        <ScrollArea.Root className="max-h-72">
          <ScrollArea.Viewport className="max-h-72">
            <div className="divide-y">
              {messages.map((message) => {
                const image = pinnedImage(message);
                return (
                  <div
                    key={message._id}
                    className="flex items-start gap-2 px-3 py-2.5"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto min-w-0 flex-1 items-start justify-start gap-2 whitespace-normal p-1 text-left"
                      onClick={() => {
                        setOpen(false);
                        onSelectMessage(
                          getProviderMessageId(message) || message._id,
                        );
                      }}
                    >
                      {image && (
                        <InboxImage
                          src={readImage(image.url)}
                          alt={
                            image.name ||
                            t('pinned-attachment', 'Pinned attachment')
                          }
                          className="size-12 shrink-0 rounded object-cover"
                        />
                      )}
                      <span className="line-clamp-3 min-w-0 flex-1 text-sm leading-5">
                        {previewOf(message)}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={unpinning || !getProviderMessageId(message)}
                      aria-label={t('unpin-message', 'Unpin message')}
                      onClick={() => handleUnpin(message)}
                      className="shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <IconPinnedOff className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Bar orientation="vertical" />
        </ScrollArea.Root>
      </Popover.Content>
    </Popover>
  );
};
