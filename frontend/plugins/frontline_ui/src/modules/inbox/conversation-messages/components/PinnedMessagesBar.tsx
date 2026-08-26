import { useMutation } from '@apollo/client';
import { IconChevronDown, IconPin, IconPinnedOff } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Button, Popover, ScrollArea, readImage, toast } from 'erxes-ui';
import { currentUserState } from 'ui-modules';

import {
  getOptimisticMessage,
  messageToPlainText,
} from '@/inbox/conversation-messages/utils/messageActions';
import { FRONTLINE_CONVERSATION_MESSAGE_PIN_TOGGLE } from '@/inbox/conversation-messages/graphql/messageActions';
import { IMessage } from '@/inbox/types/Conversation';

export const PinnedMessagesBar = ({
  messages,
  onSelectMessage,
}: {
  messages: IMessage[];
  onSelectMessage: (messageId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const currentUserId = useAtomValue(currentUserState)?._id || '';
  const [toggleMessagePin] = useMutation(
    FRONTLINE_CONVERSATION_MESSAGE_PIN_TOGGLE,
  );

  if (!messages.length) return null;

  const latestMessage = messages[0];
  const latestImage = latestMessage.attachments?.find((attachment) =>
    attachment.type.startsWith('image'),
  );
  const latestPreview =
    messageToPlainText(latestMessage.content) || 'Attachment or rich message';

  const handleUnpin = async (message: IMessage) => {
    const pinnedByIds = (message.pinnedByIds || []).filter(
      (id) => id !== currentUserId,
    );

    try {
      await toggleMessagePin({
        variables: { _id: message._id },
        optimisticResponse: {
          conversationMessagePinToggle: getOptimisticMessage(message, {
            pinnedByIds,
          }),
        },
      });
    } catch {
      toast({ title: 'Failed to unpin message', variant: 'destructive' });
    }
  };

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
            Pinned{messages.length > 1 ? ` · ${messages.length}` : ''}
          </span>
          {latestImage && (
            <img
              src={readImage(latestImage.url)}
              alt={latestImage.name || 'Pinned image'}
              className="size-6 shrink-0 rounded object-cover"
            />
          )}
          <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted-foreground">
            {latestPreview}
          </span>
          <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-[min(26rem,calc(100vw-1rem))] p-0">
        <div className="border-b px-3 py-2 text-xs font-medium">
          Pinned messages
        </div>
        <ScrollArea.Root className="max-h-72">
          <ScrollArea.Viewport className="max-h-72">
            <div className="divide-y">
              {messages.map((message) => (
                <div
                  key={message._id}
                  role="button"
                  tabIndex={0}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                  onClick={() => {
                    setOpen(false);
                    onSelectMessage(message._id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setOpen(false);
                      onSelectMessage(message._id);
                    }
                  }}
                >
                  {message.attachments
                    ?.filter((attachment) =>
                      attachment.type.startsWith('image'),
                    )
                    .slice(0, 1)
                    .map((attachment) => (
                      <img
                        key={attachment.url}
                        src={readImage(attachment.url)}
                        alt={attachment.name || 'Pinned image'}
                        className="size-12 shrink-0 rounded object-cover"
                      />
                    ))}
                  <p className="line-clamp-3 min-w-0 flex-1 text-sm leading-5">
                    {messageToPlainText(message.content) ||
                      'Attachment or rich message'}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Unpin message"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUnpin(message);
                    }}
                  >
                    <IconPinnedOff className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Bar orientation="vertical" />
        </ScrollArea.Root>
      </Popover.Content>
    </Popover>
  );
};
