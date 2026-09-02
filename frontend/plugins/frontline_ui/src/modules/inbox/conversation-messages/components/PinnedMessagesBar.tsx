import { useMutation } from '@apollo/client';
import { Button, Popover, ScrollArea, readImage, toast } from 'erxes-ui';
import { IconChevronDown, IconPin, IconPinnedOff } from '@tabler/icons-react';
import { useState } from 'react';

import { CONVERSATION_MESSAGE_PIN } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationMessageReact';
import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';
import type { IMessage } from '@/inbox/types/Conversation';

const messageText = (content?: string) =>
  content
    ?.replace(/<[^<>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Attachment or rich message';

const providerMessageId = (message: IMessage) =>
  message.providerData?.messageId ||
  message.extraData?.discordMessageId ||
  message.mid;

const pinnedImage = (message: IMessage) =>
  message.attachments?.find((attachment) =>
    attachment.type?.startsWith('image'),
  );

const PinnedMessagesTrigger = ({ messages }: { messages: IMessage[] }) => {
  const latestMessage = messages[0];
  const latestImage = pinnedImage(latestMessage);

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-10 w-full shrink-0 justify-start gap-2 rounded-none border-b bg-primary/[0.04] px-4 text-left hover:bg-primary/[0.07]"
    >
      <IconPin className="size-4 shrink-0 text-primary" />
      <span className="shrink-0 text-xs font-medium">
        Pinned{messages.length > 1 ? ` · ${messages.length}` : ''}
      </span>
      {latestImage && (
        <InboxImage
          src={readImage(latestImage.url)}
          alt={latestImage.name || 'Pinned attachment'}
          className="size-6 shrink-0 rounded object-cover"
        />
      )}
      <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted-foreground">
        {messageText(latestMessage.content)}
      </span>
      <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
    </Button>
  );
};

const PinnedMessageRow = ({
  message,
  loading,
  onSelect,
  onUnpin,
}: {
  message: IMessage;
  loading: boolean;
  onSelect: () => void;
  onUnpin: () => void;
}) => {
  const image = pinnedImage(message);

  return (
    <div className="flex items-start gap-2 px-3 py-2.5">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-start gap-2 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={onSelect}
      >
        {image && (
          <InboxImage
            src={readImage(image.url)}
            alt={image.name || 'Pinned attachment'}
            className="size-12 shrink-0 rounded object-cover"
          />
        )}
        <span className="line-clamp-3 min-w-0 flex-1 text-sm leading-5">
          {messageText(message.content)}
        </span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading || !providerMessageId(message)}
        aria-label="Unpin message"
        onClick={onUnpin}
        className="shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <IconPinnedOff className="size-4" />
      </Button>
    </div>
  );
};

const PinnedMessageList = ({
  messages,
  loading,
  onSelect,
  onUnpin,
}: {
  messages: IMessage[];
  loading: boolean;
  onSelect: (message: IMessage) => void;
  onUnpin: (message: IMessage) => void;
}) => (
  <div className="divide-y">
    {messages.map((message) => (
      <PinnedMessageRow
        key={message._id}
        message={message}
        loading={loading}
        onSelect={() => onSelect(message)}
        onUnpin={() => onUnpin(message)}
      />
    ))}
  </div>
);

const PinnedMessagesContent = ({
  messages,
  loading,
  onSelect,
  onUnpin,
}: {
  messages: IMessage[];
  loading: boolean;
  onSelect: (message: IMessage) => void;
  onUnpin: (message: IMessage) => void;
}) => (
  <Popover.Content
    align="start"
    className="w-[min(26rem,calc(100vw-1rem))] p-0"
  >
    <div className="border-b px-3 py-2 text-xs font-medium">
      Pinned messages
    </div>
    <ScrollArea.Root className="max-h-72">
      <ScrollArea.Viewport className="max-h-72">
        <PinnedMessageList
          messages={messages}
          loading={loading}
          onSelect={onSelect}
          onUnpin={onUnpin}
        />
      </ScrollArea.Viewport>
      <ScrollArea.Bar orientation="vertical" />
    </ScrollArea.Root>
  </Popover.Content>
);

export const PinnedMessagesBar = ({
  conversationId,
  messages,
  onSelectMessage,
}: {
  conversationId: string;
  messages: IMessage[];
  onSelectMessage: (messageId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [unpinMessage, { loading }] = useMutation(CONVERSATION_MESSAGE_PIN, {
    refetchQueries: ['FrontlineConversationPinnedMessages'],
  });

  if (!messages.length) return null;

  const handleUnpin = async (message: IMessage) => {
    const messageId = providerMessageId(message);
    if (!messageId) return;

    try {
      await unpinMessage({
        variables: { conversationId, messageId, remove: true },
      });
      toast({ title: 'Message unpinned' });
    } catch (error) {
      toast({
        title: 'Failed to unpin message',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <PinnedMessagesTrigger messages={messages} />
      </Popover.Trigger>
      <PinnedMessagesContent
        messages={messages}
        loading={loading}
        onSelect={(message) => {
          setOpen(false);
          onSelectMessage(providerMessageId(message) || message._id);
        }}
        onUnpin={handleUnpin}
      />
    </Popover>
  );
};
