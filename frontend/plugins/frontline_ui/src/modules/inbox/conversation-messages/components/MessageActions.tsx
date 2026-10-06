import { useMutation } from '@apollo/client';
import { Button, DropdownMenu, Tooltip, toast } from 'erxes-ui';
import {
  IconArrowBackUp,
  IconDots,
  IconPin,
  IconPinnedOff,
  IconShare3,
} from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useContext, useState } from 'react';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import { CONVERSATION_MESSAGE_PIN } from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationMessageReact';
import { IntegrationType } from '@/types/Integration';
import { ForwardMessageDialog } from '@/inbox/conversation-messages/components/ForwardMessageDialog';
import {
  INLINE_ACTION_KINDS,
  NATIVE_REPLY_KINDS,
} from '@/inbox/conversation-messages/constants/messageActions';
import { getProviderMessageId } from '@/inbox/conversation-messages/utils/message';
import { previewOf } from '@/inbox/conversation-messages/utils/messageActionText';
import { ReactionMenu } from '@/inbox/conversation-messages/components/MessageReactionMenu';
import { ActionButton } from '@/inbox/conversation-messages/components/MessageActionButton';
import { FacebookReplyWindowContext } from '@/integrations/facebook/contexts/FacebookReplyWindowContext';
import { MessageCopyActions } from '@/inbox/conversation-messages/components/MessageCopyActions';

export const MessageActions = ({
  additionalActions,
  onReply,
}: {
  additionalActions?: React.ReactNode;
  onReply?: () => void;
}) => {
  const message = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const kind = integration?.kind || '';
  const providerMessageId = getProviderMessageId(message);
  const setReply = useSetAtom(messageReplyState);
  const facebookReplyWindowExpired = useContext(FacebookReplyWindowContext);
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
  const isInstagram = kind === IntegrationType.INSTAGRAM_MESSENGER;
  const isDiscord = kind === IntegrationType.DISCORD_MESSENGER;
  const showReply =
    kind !== 'lead' &&
    (kind !== IntegrationType.FACEBOOK_MESSENGER || Boolean(providerMessageId));
  const canReply =
    showReply &&
    !facebookReplyWindowExpired &&
    (!isInstagram || Boolean(providerMessageId));
  const canForward = kind !== 'lead' && kind !== IntegrationType.FACEBOOK_POST;
  const showActionsInline = INLINE_ACTION_KINDS.has(kind);
  const isPinned = Boolean(message.extraData?.discordPinned);

  const handleReply = () => {
    if (!canReply) return;
    let authorName = 'Customer';
    if (message.userId) {
      authorName = 'You';
    } else if (message.fromBot) {
      authorName = 'AI Agent';
    } else if (kind === IntegrationType.TELEGRAM_MESSENGER) {
      authorName = message.extraData?.telegram?.senderName || authorName;
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
    onReply?.();
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

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="flex items-center gap-0.5">
        <ReactionMenu />
        {showReply && (
          <ActionButton
            label={
              facebookReplyWindowExpired
                ? 'Facebook reply window expired'
                : 'Reply'
            }
            disabled={!canReply}
            onClick={handleReply}
          >
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
            <MessageCopyActions inline />
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
                <MessageCopyActions inline={false} />
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
        />
      )}
    </Tooltip.Provider>
  );
};
