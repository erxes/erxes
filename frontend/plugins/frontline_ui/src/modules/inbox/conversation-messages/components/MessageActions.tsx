import { CopyAttachmentAction } from '@/inbox/conversation-messages/components/CopyAttachmentAction';
import { useMutation } from '@apollo/client';
import {
  Button,
  CopyText,
  DropdownMenu,
  Tooltip,
  stripHtml,
  toast,
} from 'erxes-ui';
import {
  IconArrowBackUp,
  IconCopy,
  IconDots,
  IconPin,
  IconPinnedOff,
  IconShare3,
} from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import { isSlashMenuOpenState } from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { CONVERSATION_MESSAGE_PIN } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationMessageReact';
import type { IMessage, IMessageReaction } from '@/inbox/types/Conversation';
import { IntegrationType } from '@/types/Integration';
import { currentUserState } from 'ui-modules';
import { ForwardMessageDialog } from '@/inbox/conversation-messages/components/ForwardMessageDialog';
import {
  INLINE_ACTION_KINDS,
  INSTAGRAM_REACTION_MESSAGE_KINDS,
  NATIVE_REPLY_KINDS,
  REACTIONS,
  REACTION_KINDS,
} from '@/inbox/conversation-messages/constants/messageActions';
import { getProviderMessageId } from '@/inbox/conversation-messages/utils/message';
import { previewOf } from '@/inbox/conversation-messages/utils/messageActionText';
import { ReactionMenu } from '@/inbox/conversation-messages/components/MessageReactionMenu';
import { ActionButton } from '@/inbox/conversation-messages/components/MessageActionButton';

export const MessageActions = ({
  message,
  additionalActions,
}: {
  message: IMessage;
  additionalActions?: React.ReactNode;
}) => {
  const { _id: conversationId, integration } = useConversationContext();
  const kind = integration?.kind || '';
  const providerMessageId = getProviderMessageId(message);
  const setReply = useSetAtom(messageReplyState);
  const currentUser = useAtomValue(currentUserState);
  const isSlashMenuOpen = useAtomValue(isSlashMenuOpenState);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [pinMessage, { loading: pinning }] = useMutation(
    CONVERSATION_MESSAGE_PIN,
    {
      refetchQueries: [
        'FrontlineConversationPinnedMessages',
        'ConversationMessages',
      ],
    },
  );
  const preview = previewOf(message);
  const messageText = stripHtml(message.content).trim();
  const isInstagram = kind === IntegrationType.INSTAGRAM_MESSENGER;
  const isInstagramReactionTarget =
    !isInstagram ||
    (!message.userId &&
      !message.fromBot &&
      INSTAGRAM_REACTION_MESSAGE_KINDS.has(message.messageKind || 'text'));
  const canReact =
    REACTION_KINDS.has(kind) &&
    Boolean(providerMessageId) &&
    isInstagramReactionTarget;
  const availableReactions =
    kind === IntegrationType.INSTAGRAM_MESSENGER
      ? REACTIONS.slice(0, 1)
      : REACTIONS;
  const ownReaction = (
    message.reactions?.length ? message.reactions : message.extraData?.reactions
  )?.find(
    (reaction: IMessageReaction) => reaction.senderId === currentUser?._id,
  )?.reaction;
  const isDiscord = kind === IntegrationType.DISCORD_MESSENGER;
  const canReply = kind !== 'lead';
  const canForward =
    canReply &&
    kind !== IntegrationType.FACEBOOK_MESSENGER &&
    kind !== IntegrationType.FACEBOOK_POST;
  const showActionsInline = INLINE_ACTION_KINDS.has(kind);
  const isPinned = Boolean(message.extraData?.discordPinned);

  const handleReply = () => {
    let authorName = 'Customer';
    if (message.userId) {
      authorName = 'You';
    } else if (message.fromBot) {
      authorName = 'AI Agent';
    }
    const attachment = message.attachments?.[0]?.url
      ? {
          url: message.attachments[0].url,
          name: message.attachments[0].name,
          type: message.attachments[0].type,
        }
      : undefined;
    setReply({
      messageId: message._id,
      providerMessageId,
      preview,
      authorName,
      attachment,
      nativeReply: NATIVE_REPLY_KINDS.has(kind) && Boolean(providerMessageId),
    });
  };

  const togglePin = async () => {
    if (!providerMessageId) return;
    try {
      await pinMessage({
        variables: {
          conversationId,
          messageId: providerMessageId,
          remove: isPinned,
        },
      });
      toast({ title: isPinned ? 'Message unpinned' : 'Message pinned' });
    } catch (error) {
      toast({
        title: `Failed to ${isPinned ? 'unpin' : 'pin'} message: ${
          (error as Error).message
        }`,
        variant: 'destructive',
      });
    }
  };

  if (isSlashMenuOpen) {
    return null;
  }

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="flex items-center gap-0.5">
        {REACTION_KINDS.has(kind) && isInstagramReactionTarget && (
          <ReactionMenu
            conversationId={conversationId}
            messageId={providerMessageId || ''}
            disabled={!canReact}
            disabledReason={
              !providerMessageId
                ? 'This message has no provider ID to react to'
                : 'Reactions are not supported by this channel'
            }
            selectedReaction={ownReaction}
            reactions={availableReactions}
          />
        )}
        {canReply && (
          <ActionButton label="Reply" onClick={handleReply}>
            <IconArrowBackUp className="size-4" />
          </ActionButton>
        )}
        {additionalActions}
        {showActionsInline ? (
          <>
            {canForward && (
              <ActionButton
                label="Forward"
                onClick={() => setForwardOpen(true)}
              >
                <IconShare3 className="size-4" />
              </ActionButton>
            )}
            {message.attachments?.map((attachment, index) => (
              <CopyAttachmentAction
                key={`${attachment.url}-${index}`}
                attachment={attachment}
                inline
              />
            ))}
            {messageText && (
              <CopyText
                value={messageText}
                className="size-8 justify-center rounded-md text-muted-foreground hover:bg-muted [&>span]:gap-0 [&>span]:text-[0px]"
              >
                <IconCopy className="size-4" />
                <span className="sr-only">Copy text</span>
              </CopyText>
            )}
          </>
        ) : (
          <div className="ml-0.5 border-l border-border/70 pl-0.5">
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="More message actions"
                  className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
                >
                  <IconDots className="size-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="min-w-44 rounded-xl p-1 shadow-lg"
              >
                {canForward && (
                  <DropdownMenu.Item
                    className="rounded-lg"
                    onClick={() => setForwardOpen(true)}
                  >
                    <IconShare3 className="size-4" />
                    Forward
                  </DropdownMenu.Item>
                )}
                {message.attachments?.map((attachment, index) => (
                  <CopyAttachmentAction
                    key={`${attachment.url}-${index}`}
                    attachment={attachment}
                    inline={false}
                  />
                ))}
                {messageText && (
                  <DropdownMenu.Item asChild className="rounded-lg">
                    <CopyText value={messageText} className="w-full">
                      <IconCopy className="size-4" />
                      Copy text
                    </CopyText>
                  </DropdownMenu.Item>
                )}
                {isDiscord && (
                  <DropdownMenu.Item
                    className="rounded-lg"
                    disabled={!providerMessageId || pinning}
                    onClick={togglePin}
                  >
                    {isPinned ? (
                      <IconPinnedOff className="size-4" />
                    ) : (
                      <IconPin className="size-4" />
                    )}
                    {isPinned ? 'Unpin message' : 'Pin message'}
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        )}
      </div>
      {canForward && (
        <ForwardMessageDialog
          open={forwardOpen}
          onOpenChange={setForwardOpen}
          sourceConversationId={conversationId}
          message={message}
          preview={preview}
        />
      )}
    </Tooltip.Provider>
  );
};
