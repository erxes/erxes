import { useCallback, useState } from 'react';
import type { ComponentType } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Button,
  Dialog,
  Spinner,
  Textarea,
  Tooltip,
  cn,
  toast,
  useConfirm,
} from 'erxes-ui';
import {
  IconArrowBackUp,
  IconCopy,
  IconHash,
  IconLink,
  IconPencil,
  IconPhoto,
  IconPin,
  IconPinnedOff,
  IconTrash,
} from '@tabler/icons-react';
import { currentUserState } from 'ui-modules';
import {
  getOptimisticMessage,
  copyImageToClipboard,
} from '@/inbox/conversation-messages/utils/messageActions';
import { FRONTLINE_CONVERSATION_MESSAGE_PIN_TOGGLE } from '@/inbox/conversation-messages/graphql/messageActions';
import { IMessage } from '@/inbox/types/Conversation';
import { DISCORD_CONVERSATION_CHANNEL } from '../graphql/queries';
import {
  DISCORD_DELETE_MESSAGE,
  DISCORD_EDIT_MESSAGE,
} from '../graphql/mutations';
import {
  DiscordReplyTarget,
  discordReplyToState,
} from '../states/discordReplyToState';

const PREVIEW_LENGTH = 80;

const stripToText = (html?: string): string => {
  if (!html) {
    return '';
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').trim();
};

const copyToClipboard = async (value: string, success: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast({ title: success, variant: 'default' });
  } catch {
    toast({ title: 'Failed to copy', variant: 'destructive' });
  }
};

type DiscordConversationChannel = {
  channelId?: string;
  guildId?: string;
};

const DiscordMessageAction = ({
  label,
  icon: Icon,
  disabled,
  destructive,
  onClick,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
  destructive?: boolean;
  onClick: () => void;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'size-6 rounded-sm p-0 text-muted-foreground hover:bg-accent hover:text-foreground',
          destructive && 'hover:bg-destructive/10 hover:text-destructive',
        )}
      >
        <Icon className="size-4" />
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content side="top" sideOffset={4}>
      {label}
    </Tooltip.Content>
  </Tooltip>
);

export const DiscordMessageActions = ({
  conversationId,
  messageId,
  content,
  isOwnMessage,
  databaseMessage,
}: {
  conversationId: string;
  messageId: string;
  content?: string;
  isOwnMessage?: boolean;
  databaseMessage: IMessage;
}) => {
  const currentUserId = useAtomValue(currentUserState)?._id || '';
  const setReplyTo = useSetAtom(discordReplyToState);
  const { confirm } = useConfirm();
  const text = stripToText(content);
  const imageAttachment = databaseMessage.attachments?.find((attachment) =>
    attachment.type.startsWith('image'),
  );

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const [loadChannel] = useLazyQuery<{
    discordConversationChannel: DiscordConversationChannel | null;
  }>(DISCORD_CONVERSATION_CHANNEL, {
    variables: { conversationId },
    fetchPolicy: 'cache-first',
  });

  const [editMessage, { loading: editing }] = useMutation(DISCORD_EDIT_MESSAGE);
  const [deleteMessage] = useMutation(DISCORD_DELETE_MESSAGE);
  const [toggleMessagePin] = useMutation(
    FRONTLINE_CONVERSATION_MESSAGE_PIN_TOGGLE,
  );
  const isPinned =
    databaseMessage.pinnedByIds?.includes(currentUserId) || false;

  const handlePin = async () => {
    const pinnedByIds = isPinned
      ? (databaseMessage.pinnedByIds || []).filter(
          (id) => id !== currentUserId,
        )
      : [...(databaseMessage.pinnedByIds || []), currentUserId];
    try {
      await toggleMessagePin({
        variables: { _id: databaseMessage._id },
        optimisticResponse: {
          conversationMessagePinToggle: getOptimisticMessage(databaseMessage, {
            pinnedByIds,
          }),
        },
      });
    } catch {
      toast({ title: 'Failed to update pin', variant: 'destructive' });
    }
  };

  const handleReply = useCallback(() => {
    const preview = text.slice(0, PREVIEW_LENGTH) || 'message';
    setReplyTo({ messageId, preview } as DiscordReplyTarget);
  }, [setReplyTo, messageId, text]);

  const handleCopyLink = useCallback(async () => {
    const { data } = await loadChannel();
    const channel = data?.discordConversationChannel;
    if (!channel?.guildId || !channel?.channelId) {
      toast({ title: 'Message link unavailable', variant: 'destructive' });
      return;
    }
    const link = `https://discord.com/channels/${channel.guildId}/${channel.channelId}/${messageId}`;
    await copyToClipboard(link, 'Message link copied');
  }, [loadChannel, messageId]);

  const handleCopyImage = useCallback(async () => {
    if (!imageAttachment) return;

    try {
      const copied = await copyImageToClipboard(imageAttachment.url);
      toast({
        title: copied === 'image' ? 'Image copied' : 'Image link copied',
      });
    } catch {
      toast({ title: 'Failed to copy image', variant: 'destructive' });
    }
  }, [imageAttachment]);

  const handleOpenEdit = useCallback(() => {
    setDraft(text);
    setEditOpen(true);
  }, [text]);

  const handleSaveEdit = useCallback(async () => {
    const next = draft.trim();

    if (!next || next === text) {
      setEditOpen(false);
      return;
    }

    try {
      await editMessage({
        variables: { conversationId, messageId, content: next },
      });
      setEditOpen(false);
      toast({ title: 'Message updated', variant: 'default' });
    } catch (e) {
      toast({
        title: `Failed to edit: ${(e as Error).message}`,
        variant: 'destructive',
      });
    }
  }, [editMessage, conversationId, messageId, draft, text]);

  const handleDelete = useCallback(() => {
    confirm({
      message: 'Delete this message from Discord? This cannot be undone.',
    })
      .then(() =>
        confirm({
          message: 'Deleting removes the message from Discord for everyone.',
          options: { confirmationValue: 'delete', okLabel: 'Delete' },
        }),
      )
      .then(async () => {
        try {
          await deleteMessage({ variables: { conversationId, messageId } });
          toast({ title: 'Message deleted', variant: 'default' });
        } catch (e) {
          toast({
            title: `Failed to delete: ${(e as Error).message}`,
            variant: 'destructive',
          });
        }
      });
  }, [confirm, deleteMessage, conversationId, messageId]);

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="flex h-8 shrink-0 items-center gap-px rounded-md border bg-background p-0.5 opacity-0 shadow-xs transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <DiscordMessageAction
          label={isPinned ? 'Unpin message' : 'Pin message'}
          icon={isPinned ? IconPinnedOff : IconPin}
          onClick={handlePin}
        />
        <DiscordMessageAction
          label="Reply"
          icon={IconArrowBackUp}
          onClick={handleReply}
        />
        <DiscordMessageAction
          label="Copy text"
          icon={IconCopy}
          disabled={!text}
          onClick={() => copyToClipboard(text, 'Text copied')}
        />
        {imageAttachment && (
          <DiscordMessageAction
            label="Copy image"
            icon={IconPhoto}
            onClick={handleCopyImage}
          />
        )}
        <DiscordMessageAction
          label="Copy message link"
          icon={IconLink}
          onClick={handleCopyLink}
        />
        <DiscordMessageAction
          label="Copy message ID"
          icon={IconHash}
          onClick={() => copyToClipboard(messageId, 'Message ID copied')}
        />
        {isOwnMessage && (
          <>
            <DiscordMessageAction
              label="Edit message"
              icon={IconPencil}
              onClick={handleOpenEdit}
            />
            <DiscordMessageAction
              label="Delete message"
              icon={IconTrash}
              destructive
              onClick={handleDelete}
            />
          </>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Edit message</Dialog.Title>
            <Dialog.Description>
              The message is updated in Discord and marked as edited there.
            </Dialog.Description>
          </Dialog.Header>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            autoFocus
          />
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              disabled={editing || !draft.trim()}
              onClick={handleSaveEdit}
            >
              {editing && <Spinner size="sm" />}
              Save
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </Tooltip.Provider>
  );
};
