import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Command,
  Dialog,
  DropdownMenu,
  Input,
  Spinner,
  Tooltip,
  toast,
} from 'erxes-ui';
import {
  IconArrowBackUp,
  IconCopy,
  IconMoodSmile,
  IconPin,
  IconPinnedOff,
  IconShare3,
} from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';

import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import {
  CONVERSATION_MESSAGE_PIN,
  CONVERSATION_MESSAGE_REACT,
} from '@/inbox/conversations/conversation-detail/graphql/mutations/conversationMessageReact';
import { GET_CONVERSATIONS } from '@/inbox/conversations/graphql/queries/getConversations';
import type { IConversation, IMessage } from '@/inbox/types/Conversation';
import { IntegrationType } from '@/types/Integration';
import { currentUserState } from 'ui-modules';

const REACTIONS = ['love', 'like', 'wow', 'haha', 'sad', 'angry'] as const;
const REACTION_EMOJI: Record<(typeof REACTIONS)[number], string> = {
  love: '❤️',
  like: '👍',
  wow: '😮',
  haha: '😂',
  sad: '😢',
  angry: '😠',
};

const textOf = (html?: string) => {
  if (!html) return '';
  const document = new DOMParser().parseFromString(html, 'text/html');
  return (document.body.textContent || '').trim();
};

const previewOf = (message: IMessage) =>
  textOf(message.content).slice(0, 120) ||
  message.providerData?.previewText ||
  message.attachments?.[0]?.name ||
  'Attachment';

const nativeReplyKinds = new Set<string>([IntegrationType.DISCORD_MESSENGER]);
const reactionKinds = new Set<string>([
  IntegrationType.DISCORD_MESSENGER,
  IntegrationType.INSTAGRAM_MESSENGER,
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
          size="icon-sm"
          disabled={disabled}
          aria-label={label}
          onClick={onClick}
          className="rounded-sm text-muted-foreground hover:text-foreground"
        >
          {children}
        </Button>
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);

export const MessageActions = ({ message }: { message: IMessage }) => {
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
    { refetchQueries: ['FrontlineConversationPinnedMessages'] },
  );
  const preview = previewOf(message);
  const canReact = reactionKinds.has(kind) && Boolean(providerMessageId);
  const ownReaction = (message.reactions || message.extraData?.reactions)?.find(
    (reaction) => reaction.senderId === currentUser?._id,
  )?.reaction;
  const isDiscord = kind === IntegrationType.DISCORD_MESSENGER;
  const isPinned = Boolean(message.extraData?.discordPinned);

  const handleReply = () => {
    setReply({
      messageId: message._id,
      providerMessageId,
      preview,
      authorName: message.userId
        ? 'You'
        : message.fromBot
        ? 'AI Agent'
        : 'Customer',
      attachment: message.attachments?.[0]?.url
        ? {
            url: message.attachments[0].url,
            name: message.attachments[0].name,
            type: message.attachments[0].type,
          }
        : undefined,
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
        <ActionButton label="Reply" onClick={handleReply}>
          <IconArrowBackUp className="size-4" />
        </ActionButton>
        <ReactionMenu
          conversationId={conversationId}
          messageId={providerMessageId || ''}
          disabled={!canReact}
          disabledReason={
            providerMessageId
              ? 'Reactions are not supported by this channel'
              : 'This message has no provider ID to react to'
          }
          selectedReaction={ownReaction}
        />
        <ActionButton label="Forward" onClick={() => setForwardOpen(true)}>
          <IconShare3 className="size-4" />
        </ActionButton>
        <ActionButton label="Copy text" disabled={!preview} onClick={copy}>
          <IconCopy className="size-4" />
        </ActionButton>
        {isDiscord && (
          <ActionButton
            label={isPinned ? 'Unpin message' : 'Pin message'}
            disabled={!providerMessageId || pinning}
            onClick={togglePin}
          >
            {isPinned ? (
              <IconPinnedOff className="size-4" />
            ) : (
              <IconPin className="size-4" />
            )}
          </ActionButton>
        )}
      </div>
      <ForwardMessageDialog
        open={forwardOpen}
        onOpenChange={setForwardOpen}
        sourceConversationId={conversationId}
        message={message}
        preview={preview}
      />
    </Tooltip.Provider>
  );
};

const ReactionMenu = ({
  conversationId,
  messageId,
  disabled,
  disabledReason,
  selectedReaction,
}: {
  conversationId: string;
  messageId: string;
  disabled: boolean;
  disabledReason: string;
  selectedReaction?: string;
}) => {
  const [react, { loading }] = useMutation(CONVERSATION_MESSAGE_REACT, {
    refetchQueries: [
      'ConversationMessages',
      'InstagramConversationMessages',
      'FacebookConversationMessages',
    ],
  });

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
          size="icon-sm"
          aria-label="Add reaction"
          disabled={loading}
          className="rounded-sm text-muted-foreground hover:text-foreground"
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <IconMoodSmile className="size-4" />
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="flex min-w-0 gap-0.5 p-1">
        {REACTIONS.map((reaction) => (
          <DropdownMenu.Item
            key={reaction}
            aria-label={`React with ${reaction}`}
            className="p-1.5 text-lg"
            onClick={async () => {
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
};

const ForwardMessageDialog = ({
  open,
  onOpenChange,
  sourceConversationId,
  message,
  preview,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceConversationId: string;
  message: IMessage;
  preview: string;
}) => {
  const [note, setNote] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const { addConversationMessage, loading } = useConversationMessageAdd();
  const { data, loading: conversationsLoading } = useQuery<{
    conversations: { list: IConversation[] };
  }>(GET_CONVERSATIONS, {
    variables: { limit: 50, status: 'open' },
    skip: !open,
    fetchPolicy: 'cache-and-network',
  });
  const conversations = useMemo(
    () =>
      (data?.conversations.list || []).filter(
        (conversation) => conversation._id !== sourceConversationId,
      ),
    [data?.conversations.list, sourceConversationId],
  );

  const handleForward = async () => {
    if (!selectedId) return;
    const prefix = note.trim() ? `<p>${note.trim()}</p>` : '';
    const forwarded = `<blockquote><strong>Forwarded message</strong><br/>${preview}</blockquote>`;
    try {
      await addConversationMessage({
        variables: {
          conversationId: selectedId,
          content: `${prefix}${forwarded}`,
          attachments: message.attachments || [],
          internal: false,
          extraInfo: {
            forwardedFrom: {
              conversationId: sourceConversationId,
              messageId: message._id,
            },
          },
        },
        refetchQueries: [
          'Conversations',
          'ConversationMessages',
          'ConversationCounts',
          'FrontlineInboxSidebarWorkCounts',
        ],
      });
      toast({ title: 'Message forwarded', variant: 'default' });
      setNote('');
      setSelectedId('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: `Failed to forward: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>Forward message</Dialog.Title>
          <Dialog.Description>
            Choose another conversation. The content is sent as a snapshot and
            will not change if the original is edited.
          </Dialog.Description>
        </Dialog.Header>
        <div className="rounded-md border-l-2 border-primary bg-muted px-3 py-2 text-sm text-muted-foreground">
          <div className="line-clamp-3">{preview}</div>
        </div>
        <Command className="rounded-md border">
          <Command.Input placeholder="Search conversations" />
          <Command.List className="max-h-64 overflow-y-auto">
            {conversationsLoading && (
              <div className="flex justify-center p-4">
                <Spinner size="sm" />
              </div>
            )}
            <Command.Empty>No conversations found</Command.Empty>
            {conversations.map((conversation) => {
              const customer = conversation.customer;
              const name =
                [customer?.firstName, customer?.lastName]
                  .filter(Boolean)
                  .join(' ') ||
                conversation.integration?.name ||
                'Conversation';
              return (
                <Command.Item
                  key={conversation._id}
                  value={`${name} ${conversation.content || ''}`}
                  onSelect={() => setSelectedId(conversation._id)}
                  className={selectedId === conversation._id ? 'bg-accent' : ''}
                >
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                  <span className="max-w-48 truncate text-xs text-muted-foreground">
                    {textOf(conversation.content)}
                  </span>
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
        <Input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add a note (optional)"
        />
        <Dialog.Footer>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedId || loading}
            onClick={handleForward}
          >
            {loading && <Spinner size="sm" />} Forward
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
