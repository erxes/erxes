import { useCallback, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  Spinner,
  Textarea,
  Tooltip,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconLink, IconPencil, IconTrash } from '@tabler/icons-react';
import { DISCORD_CONVERSATION_CHANNEL } from '../graphql/queries';
import {
  DISCORD_DELETE_MESSAGE,
  DISCORD_EDIT_MESSAGE,
} from '../graphql/mutations';

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

export const DiscordMessageActions = ({
  conversationId,
  messageId,
  content,
  isOwnMessage,
}: {
  conversationId: string;
  messageId: string;
  content?: string;
  isOwnMessage?: boolean;
}) => {
  const { confirm } = useConfirm();
  const text = stripToText(content);

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
    <>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Copy Discord message link"
            onClick={handleCopyLink}
            className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconLink className="size-4" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Copy message link</Tooltip.Content>
      </Tooltip>
      {isOwnMessage && (
        <>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Edit Discord message"
                onClick={handleOpenEdit}
                className="size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <IconPencil className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Edit message</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Delete Discord message"
                onClick={handleDelete}
                className="size-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <IconTrash className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Delete message</Tooltip.Content>
          </Tooltip>
        </>
      )}

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
    </>
  );
};
