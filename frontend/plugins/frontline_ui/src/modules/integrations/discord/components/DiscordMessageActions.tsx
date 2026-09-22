import { type ReactNode, useCallback, useState } from 'react';
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

type MessageActionButtonProps = {
  label: string;
  tooltip: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
};

const MessageActionButton = ({
  label,
  tooltip,
  icon,
  onClick,
  destructive,
}: MessageActionButtonProps) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        onClick={onClick}
        className={`size-8 rounded-md text-muted-foreground ${
          destructive
            ? 'hover:bg-destructive/10 hover:text-destructive'
            : 'hover:bg-muted hover:text-foreground'
        }`}
      >
        {icon}
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>{tooltip}</Tooltip.Content>
  </Tooltip>
);

type OwnMessageActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

const OwnMessageActions = ({ onEdit, onDelete }: OwnMessageActionsProps) => (
  <>
    <MessageActionButton
      label="Edit Discord message"
      tooltip="Edit message"
      icon={<IconPencil className="size-4" />}
      onClick={onEdit}
    />
    <MessageActionButton
      label="Delete Discord message"
      tooltip="Delete message"
      icon={<IconTrash className="size-4" />}
      onClick={onDelete}
      destructive
    />
  </>
);

type EditMessageDialogActionsProps = {
  editing: boolean;
  saveDisabled: boolean;
  onSave: () => void;
};

const EditMessageDialogActions = ({
  editing,
  saveDisabled,
  onSave,
}: EditMessageDialogActionsProps) => (
  <Dialog.Footer>
    <Dialog.Close asChild>
      <Button variant="ghost" type="button">
        Cancel
      </Button>
    </Dialog.Close>
    <Button type="button" disabled={saveDisabled} onClick={onSave}>
      {editing && <Spinner size="sm" />}
      Save
    </Button>
  </Dialog.Footer>
);

type EditMessageDialogProps = {
  open: boolean;
  draft: string;
  editing: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (draft: string) => void;
  onSave: () => void;
};

const EditMessageDialog = ({
  open,
  draft,
  editing,
  onOpenChange,
  onDraftChange,
  onSave,
}: EditMessageDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <Dialog.Content className="max-w-lg">
      <Dialog.Header>
        <Dialog.Title>Edit message</Dialog.Title>
        <Dialog.Description>
          The message is updated in Discord and marked as edited there.
        </Dialog.Description>
      </Dialog.Header>
      <Textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        rows={5}
      />
      <EditMessageDialogActions
        editing={editing}
        saveDisabled={editing || !draft.trim()}
        onSave={onSave}
      />
    </Dialog.Content>
  </Dialog>
);

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
      <MessageActionButton
        label="Copy Discord message link"
        tooltip="Copy message link"
        icon={<IconLink className="size-4" />}
        onClick={handleCopyLink}
      />
      {isOwnMessage && (
        <OwnMessageActions onEdit={handleOpenEdit} onDelete={handleDelete} />
      )}
      <EditMessageDialog
        open={editOpen}
        draft={draft}
        editing={editing}
        onOpenChange={setEditOpen}
        onDraftChange={setDraft}
        onSave={handleSaveEdit}
      />
    </>
  );
};
