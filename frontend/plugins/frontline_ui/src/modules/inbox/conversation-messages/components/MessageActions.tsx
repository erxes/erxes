import { useMutation } from '@apollo/client';
import { Button, DropdownMenu, Spinner, Tooltip, cn, toast } from 'erxes-ui';
import {
  IconArrowBackUp,
  IconCopy,
  IconDots,
  IconMoodSmile,
  IconPin,
  IconPinnedOff,
  IconShare3,
} from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';

import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import {
  CONVERSATION_MESSAGE_PIN,
  CONVERSATION_MESSAGE_REACT,
} from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationMessageReact';
import type { IMessage } from '@/inbox/types/Conversation';
import { IntegrationType } from '@/types/Integration';
import { currentUserState } from 'ui-modules';
import { ForwardMessageDialog } from '@/inbox/conversation-messages/components/ForwardMessageDialog';

const REACTIONS = ['love', 'like', 'wow', 'haha', 'sad', 'angry'] as const;
const REACTION_EMOJI: Record<(typeof REACTIONS)[number], string> = {
  love: '❤️',
  like: '👍',
  wow: '😮',
  haha: '😂',
  sad: '😢',
  angry: '😠',
};

export const textOf = (html?: string) => {
  if (!html) return '';
  const document = new DOMParser().parseFromString(html, 'text/html');
  return (document.body.textContent || '').trim();
};

const previewOf = (message: IMessage) =>
  textOf(message.content).slice(0, 120) ||
  message.providerData?.previewText ||
  message.attachments?.[0]?.name ||
  'Attachment';

const nativeReplyKinds = new Set<string>([
  IntegrationType.FACEBOOK_MESSENGER,
  IntegrationType.DISCORD_MESSENGER,
  IntegrationType.INSTAGRAM_MESSENGER,
]);
const reactionKinds = new Set<string>([
  IntegrationType.FACEBOOK_MESSENGER,
  IntegrationType.DISCORD_MESSENGER,
  IntegrationType.INSTAGRAM_MESSENGER,
]);
const instagramReactionMessageKinds = new Set([
  'text',
  'image',
  'video',
  'audio',
  'file',
]);
const inlineActionKinds = new Set<string>([
  IntegrationType.FACEBOOK_MESSENGER,
  IntegrationType.INSTAGRAM_MESSENGER,
  IntegrationType.ERXES_MESSENGER,
]);

const ActionButton = ({
  label,
  disabled,
  children,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={label}
          onClick={onClick}
          className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {children}
        </Button>
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);

export const MessageActions = ({
  message,
  additionalActions,
}: {
  message: IMessage;
  additionalActions?: React.ReactNode;
}) => {
  const { _id: conversationId, integration } = useConversationContext();
  const kind = integration?.kind || '';
  const providerMessageId =
    message.providerData?.messageId ||
    message.extraData?.discordMessageId ||
    message.mid;
  const setReply = useSetAtom(messageReplyState);
  const currentUser = useAtomValue(currentUserState);
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
  const isInstagramReactionTarget =
    !isInstagram ||
    (!message.userId &&
      !message.fromBot &&
      instagramReactionMessageKinds.has(message.messageKind || 'text'));
  const canReact =
    reactionKinds.has(kind) &&
    Boolean(providerMessageId) &&
    isInstagramReactionTarget;
  const availableReactions =
    kind === IntegrationType.INSTAGRAM_MESSENGER
      ? REACTIONS.slice(0, 1)
      : REACTIONS;
  const ownReaction = (
    message.reactions?.length ? message.reactions : message.extraData?.reactions
  )?.find((reaction) => reaction.senderId === currentUser?._id)?.reaction;
  const isDiscord = kind === IntegrationType.DISCORD_MESSENGER;
  const canReplyOrForward = kind !== 'lead';
  const showActionsInline = inlineActionKinds.has(kind);
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
      nativeReply: nativeReplyKinds.has(kind) && Boolean(providerMessageId),
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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      toast({ title: 'Message copied', variant: 'default' });
    } catch {
      toast({ title: 'Failed to copy message', variant: 'destructive' });
    }
  };

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="flex items-center gap-0.5">
        {reactionKinds.has(kind) && isInstagramReactionTarget && (
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
        {canReplyOrForward && (
          <ActionButton label="Reply" onClick={handleReply}>
            <IconArrowBackUp className="size-4" />
          </ActionButton>
        )}
        {additionalActions}
        {showActionsInline ? (
          <>
            <ActionButton label="Forward" onClick={() => setForwardOpen(true)}>
              <IconShare3 className="size-4" />
            </ActionButton>
            <ActionButton label="Copy text" disabled={!preview} onClick={copy}>
              <IconCopy className="size-4" />
            </ActionButton>
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
                {canReplyOrForward && (
                  <DropdownMenu.Item
                    className="rounded-lg"
                    onClick={() => setForwardOpen(true)}
                  >
                    <IconShare3 className="size-4" />
                    Forward
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item
                  className="rounded-lg"
                  disabled={!preview}
                  onClick={copy}
                >
                  <IconCopy className="size-4" />
                  Copy text
                </DropdownMenu.Item>
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
      {canReplyOrForward && (
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

function ReactionMenu({
  conversationId,
  messageId,
  disabled,
  disabledReason,
  selectedReaction,
  reactions,
}: Readonly<{
  conversationId: string;
  messageId: string;
  disabled: boolean;
  disabledReason: string;
  selectedReaction?: string;
  reactions: readonly (typeof REACTIONS)[number][];
}>) {
  const [react, { loading }] = useMutation(CONVERSATION_MESSAGE_REACT, {
    refetchQueries: [
      'ConversationMessages',
      'InstagramConversationMessages',
      'FacebookConversationMessages',
    ],
  });

  const handleReaction = async (reaction: (typeof REACTIONS)[number]) => {
    const remove = selectedReaction === reaction;
    try {
      await react({
        variables: {
          conversationId,
          messageId,
          reaction,
          remove,
        },
      });
      toast({
        title: remove ? 'Reaction removed' : 'Reaction added',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: `Failed to react: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  if (reactions.length === 1) {
    const reaction = reactions[0];
    const selected = selectedReaction === reaction;

    let reactionLabel = 'Add love reaction';
    if (disabled) {
      reactionLabel = disabledReason;
    } else if (selected) {
      reactionLabel = 'Remove love reaction';
    }

    return (
      <ActionButton
        label={reactionLabel}
        disabled={disabled || loading}
        onClick={() => {
          handleReaction(reaction);
        }}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <span
            className={cn(
              'text-base leading-none grayscale transition-all',
              selected && 'scale-110 grayscale-0',
            )}
          >
            {REACTION_EMOJI[reaction]}
          </span>
        )}
      </ActionButton>
    );
  }

  if (disabled) {
    return (
      <ActionButton label={disabledReason} disabled onClick={() => undefined}>
        <IconMoodSmile className="size-4" />
      </ActionButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Add reaction"
          disabled={loading}
          className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <IconMoodSmile className="size-4" />
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="flex min-w-0 gap-0.5 p-1">
        {reactions.map((reaction) => (
          <DropdownMenu.Item
            key={reaction}
            aria-label={`React with ${reaction}`}
            className="p-1.5 text-lg"
            onClick={() => {
              handleReaction(reaction);
            }}
          >
            <span
              className={
                selectedReaction === reaction
                  ? 'rounded bg-accent ring-1 ring-primary'
                  : undefined
              }
            >
              {REACTION_EMOJI[reaction]}
            </span>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
