import { useQuery } from '@apollo/client';
import { Button, Command, Dialog, Input, Spinner, toast } from 'erxes-ui';
import { useMemo, useState } from 'react';

import { textOf } from '@/inbox/conversation-messages/components/MessageActions';
import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';
import { GET_CONVERSATIONS } from '@/inbox/conversations/graphql/queries/getConversations';
import type { IConversation, IMessage } from '@/inbox/types/Conversation';

type ForwardMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceConversationId: string;
  message: IMessage;
  preview: string;
};

const attachmentFallbackName = (type?: string) => {
  if (type === 'ig_post') return 'Instagram post';
  if (type === 'ig_reel') return 'Instagram reel';
  if (type === 'share') return 'Shared post';
  return 'Attachment';
};

const uniqueAttachments = (attachments: IMessage['attachments'] = []) => {
  const seenUrls = new Set<string>();

  return attachments.filter((attachment) => {
    if (!attachment.url) return true;
    const normalizedUrl = attachment.url.split(/[?#]/, 1)[0];
    if (seenUrls.has(normalizedUrl)) return false;
    seenUrls.add(normalizedUrl);
    return true;
  });
};

const forwardedContentText = (
  content: string | undefined,
  hasAttachments: boolean,
) => {
  const text = textOf(content)
    .replace(/^(?:Forwarded message\s*)+/i, '')
    .trim();

  return hasAttachments && /^Attachment$/i.test(text) ? '' : text;
};

export const ForwardMessageDialog = ({
  open,
  onOpenChange,
  sourceConversationId,
  message,
  preview,
}: ForwardMessageDialogProps) => {
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
      (data?.conversations?.list || []).filter(
        (conversation) => conversation._id !== sourceConversationId,
      ),
    [data?.conversations?.list, sourceConversationId],
  );

  const handleForward = async () => {
    if (!selectedId) return;
    const existingSnapshot = message.extraData?.forwardedSnapshot;
    const messageText = textOf(message.content);
    const hasSocialShare = message.attachments?.some(
      (attachment) =>
        attachment.type === 'share' ||
        attachment.type === 'ig_post' ||
        attachment.type === 'ig_reel',
    );
    const snapshot = {
      ...(existingSnapshot || {
        content:
          hasSocialShare &&
          ['This message has an attachment', 'Shared content'].includes(
            messageText,
          )
            ? undefined
            : messageText || undefined,
        embeds: message.extraData?.embeds,
        stickers: message.extraData?.stickers,
        poll: message.extraData?.poll,
        messageKind: message.messageKind,
        providerData: message.providerData,
        createdAt: message.createdAt,
      }),
      attachments: uniqueAttachments(
        existingSnapshot?.attachments || message.attachments,
      ),
    };
    const forwardAttachments = (snapshot.attachments || []).map(
      (attachment) => ({
        url: attachment.url,
        name: attachment.name || attachmentFallbackName(attachment.type),
        type: attachment.type,
        size: attachment.size,
        duration: attachment.duration,
      }),
    );
    const forwardedText = forwardedContentText(
      snapshot.content,
      Boolean(forwardAttachments.length),
    );
    const forwardedBody = forwardedText || preview;
    const noteContent = note.trim() ? `<p>${note.trim()}</p>` : '';
    const forwardedContent = `<blockquote><strong>Forwarded message</strong><br/>${forwardedBody}</blockquote>`;
    try {
      await addConversationMessage({
        variables: {
          conversationId: selectedId,
          content: `${noteContent}${forwardedContent}`,
          attachments: forwardAttachments,
          internal: false,
          extraInfo: {
            forwardedNote: note.trim(),
            forwardedFrom: {
              conversationId: sourceConversationId,
              messageId: message._id,
            },
            forwardedSnapshot: snapshot,
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
            Choose another conversation. The destination platform will receive
            a forwarded marker, while erxes keeps a tagged snapshot of the
            original message.
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
