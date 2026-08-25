import { useMutation } from '@apollo/client';
import {
  IconArrowBackUp,
  IconCopy,
  IconPencil,
  IconPhoto,
  IconPin,
  IconPinnedOff,
  IconTrash,
} from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useState, type ComponentType } from 'react';
import {
  Button,
  Dialog,
  Textarea,
  Tooltip,
  cn,
  readImage,
  toast,
  useConfirm,
} from 'erxes-ui';
import { currentUserState } from 'ui-modules';

import {
  FRONTLINE_CONVERSATION_MESSAGE_EDIT,
  FRONTLINE_CONVERSATION_MESSAGE_PIN_TOGGLE,
  FRONTLINE_CONVERSATION_MESSAGE_REMOVE,
} from '@/inbox/conversation-messages/graphql/messageActions';
import { IMessage } from '@/inbox/types/Conversation';
import { discordReplyToState } from '@/integrations/discord/states/discordReplyToState';

type JsonRecord = Record<string, unknown>;

const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const inlineContentToText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(inlineContentToText).join('');
  if (!isJsonRecord(value)) return '';
  if (typeof value.text === 'string') return value.text;
  return inlineContentToText(value.content);
};

const blockToText = (value: unknown): string => {
  if (!isJsonRecord(value)) return inlineContentToText(value);

  const content = inlineContentToText(value.content);
  const children = Array.isArray(value.children)
    ? value.children.map(blockToText).filter(Boolean).join('\n')
    : '';

  return [content, children].filter(Boolean).join('\n');
};

const parseBlockNoteText = (content: string) => {
  try {
    const parsed: unknown = JSON.parse(content);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(blockToText).join('\n').trim();
  } catch {
    return null;
  }
};

export const messageToPlainText = (content?: string) => {
  if (!content) return '';

  const blockNoteText = parseBlockNoteText(content);
  if (blockNoteText !== null) return blockNoteText;

  const document = new DOMParser().parseFromString(content, 'text/html');
  return (document.body.textContent || '').trim();
};

const serializeInternalNote = (text: string, originalContent?: string) => {
  let originalBlock: JsonRecord | undefined;

  try {
    const parsed: unknown = JSON.parse(originalContent || '');
    if (Array.isArray(parsed) && isJsonRecord(parsed[0])) {
      originalBlock = parsed[0];
    }
  } catch {
    originalBlock = undefined;
  }

  const props = isJsonRecord(originalBlock?.props)
    ? originalBlock.props
    : {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      };

  return JSON.stringify(
    text.split('\n').map((line, index) => ({
      id:
        index === 0 && typeof originalBlock?.id === 'string'
          ? originalBlock.id
          : crypto.randomUUID(),
      type: 'paragraph',
      props,
      content: [{ type: 'text', text: line, styles: {} }],
      children: [],
    })),
  );
};

const convertImageToPng = async (blob: Blob) => {
  if (blob.type === 'image/png') return blob;

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((pngBlob) => {
      if (pngBlob) resolve(pngBlob);
      else reject(new Error('Could not convert image'));
    }, 'image/png');
  });
};

export const copyImageToClipboard = async (url: string) => {
  const resolvedUrl = readImage(url);

  try {
    const response = await fetch(resolvedUrl);
    if (!response.ok) throw new Error('Could not load image');

    const pngBlob = await convertImageToPng(await response.blob());
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': pngBlob }),
    ]);
    return 'image' as const;
  } catch {
    await navigator.clipboard.writeText(resolvedUrl);
    return 'link' as const;
  }
};

export const getOptimisticMessage = (
  message: IMessage,
  fields: Partial<IMessage>,
) => ({
  __typename: 'ConversationMessage',
  ...message,
  ...fields,
});

export const MessageActionButton = ({
  label,
  icon: Icon,
  destructive,
  active,
  onClick,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  destructive?: boolean;
  active?: boolean;
  onClick: () => void;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          'size-6 rounded-sm p-0 text-muted-foreground hover:bg-accent hover:text-foreground',
          active && 'bg-primary/10 text-primary',
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

export const MessageActions = ({ message }: { message: IMessage }) => {
  const setReplyTo = useSetAtom(discordReplyToState);
  const currentUserId = useAtomValue(currentUserState)?._id || '';
  const { confirm } = useConfirm();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(messageToPlainText(message.content));
  const text = messageToPlainText(message.content);
  const imageAttachment = message.attachments?.find((attachment) =>
    attachment.type.startsWith('image'),
  );
  const isPinned = message.pinnedByIds?.includes(currentUserId) || false;
  const canEdit =
    Boolean(currentUserId) &&
    message.internal === true &&
    message.userId === currentUserId;

  const [editMessage, { loading: editing }] = useMutation(
    FRONTLINE_CONVERSATION_MESSAGE_EDIT,
  );
  const [removeMessage] = useMutation(
    FRONTLINE_CONVERSATION_MESSAGE_REMOVE,
  );
  const [toggleMessagePin] = useMutation(
    FRONTLINE_CONVERSATION_MESSAGE_PIN_TOGGLE,
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Message copied' });
    } catch {
      toast({ title: 'Failed to copy message', variant: 'destructive' });
    }
  }, [text]);

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

  const handlePin = async () => {
    const pinnedByIds = isPinned
      ? (message.pinnedByIds || []).filter((id) => id !== currentUserId)
      : [...(message.pinnedByIds || []), currentUserId];

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
      toast({ title: 'Failed to update pin', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    const content = draft.trim();
    if (!content || content === text) {
      setEditOpen(false);
      return;
    }

    const storedContent = message.internal
      ? serializeInternalNote(content, message.content)
      : content;

    try {
      await editMessage({
        variables: { _id: message._id, content: storedContent },
        optimisticResponse: {
          conversationMessageEdit: getOptimisticMessage(message, {
            content: storedContent,
            editedAt: new Date().toISOString(),
          }),
        },
      });
      setEditOpen(false);
      toast({ title: 'Note updated' });
    } catch (error) {
      toast({
        title: `Failed to update note: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  const handleRemove = () => {
    confirm({ message: 'Delete this internal note?' }).then(async () => {
      try {
        await removeMessage({
          variables: { _id: message._id },
          optimisticResponse: {
            conversationMessageRemove: getOptimisticMessage(message, {
              content: '',
              attachments: [],
              deletedAt: new Date().toISOString(),
            }),
          },
        });
        toast({ title: 'Note deleted' });
      } catch {
        toast({ title: 'Failed to delete note', variant: 'destructive' });
      }
    });
  };

  if (message.deletedAt) return null;

  return (
    <>
      <Tooltip.Provider delayDuration={0}>
        <div className="flex h-8 shrink-0 items-center gap-px rounded-md border bg-background p-0.5 opacity-0 shadow-xs transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <MessageActionButton
            label="Reply in internal note"
            icon={IconArrowBackUp}
            onClick={() =>
              setReplyTo({
                messageId: message._id,
                preview: text.slice(0, 80) || 'Message',
                internal: true,
              })
            }
          />
          <MessageActionButton
            label={isPinned ? 'Unpin message' : 'Pin message'}
            icon={isPinned ? IconPinnedOff : IconPin}
            active={isPinned}
            onClick={handlePin}
          />
          {text && (
            <MessageActionButton
              label="Copy text"
              icon={IconCopy}
              onClick={handleCopy}
            />
          )}
          {imageAttachment && (
            <MessageActionButton
              label="Copy image"
              icon={IconPhoto}
              onClick={handleCopyImage}
            />
          )}
          {canEdit && (
            <>
              <MessageActionButton
                label="Edit note"
                icon={IconPencil}
                onClick={() => {
                  setDraft(text);
                  setEditOpen(true);
                }}
              />
              <MessageActionButton
                label="Delete note"
                icon={IconTrash}
                destructive
                onClick={handleRemove}
              />
            </>
          )}
        </div>
      </Tooltip.Provider>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Content className="max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Edit internal note</Dialog.Title>
            <Dialog.Description>
              Changes are shown to everyone viewing this conversation.
            </Dialog.Description>
          </Dialog.Header>
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            autoFocus
          />
          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button disabled={editing || !draft.trim()} onClick={handleEdit}>
              Save
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
