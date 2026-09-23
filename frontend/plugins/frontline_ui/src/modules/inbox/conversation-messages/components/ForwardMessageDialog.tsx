import { useQuery } from '@apollo/client';
import {
  Button,
  Command,
  Dialog,
  Input,
  Spinner,
  stripHtml,
  toast,
  type IAttachment,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useConversationMessageAdd } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageAdd';
import { GET_CONVERSATIONS } from '@/inbox/conversations/graphql/queries/getConversations';
import type { IConversation, IMessage } from '@/inbox/types/Conversation';
import { stripForwardedMarkers } from '@/inbox/conversation-messages/utils/messageActionText';

type ForwardMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceConversationId: string;
  message: IMessage;
  preview: string;
};

const forwardMessageSchema = z.object({
  destinationId: z.string().min(1, 'Choose a conversation'),
  note: z.string().trim().max(2_000, 'Note is too long'),
});

type ForwardMessageForm = z.infer<typeof forwardMessageSchema>;

const ConversationOption = ({
  conversation,
  selected,
  onSelect,
}: {
  conversation: IConversation;
  selected: boolean;
  onSelect: () => void;
}) => {
  const customer = conversation.customer;
  const name =
    [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') ||
    conversation.integration?.name ||
    'Conversation';

  return (
    <Command.Item
      value={`${name} ${conversation.content || ''}`}
      onSelect={onSelect}
      className={selected ? 'bg-accent' : ''}
    >
      <span className="min-w-0 flex-1 truncate">{name}</span>
      <span className="max-w-48 truncate text-xs text-muted-foreground">
        {stripHtml(conversation.content)}
      </span>
    </Command.Item>
  );
};

const ForwardConversationList = ({
  conversations,
  loading,
  selectedId,
  onSelect,
}: {
  conversations: IConversation[];
  loading: boolean;
  selectedId: string;
  onSelect: (conversationId: string) => void;
}) => (
  <Command className="rounded-md border">
    <Command.Input placeholder="Search conversations" />
    <Command.List className="max-h-64 overflow-y-auto">
      {loading && (
        <div className="flex justify-center p-4">
          <Spinner size="sm" />
        </div>
      )}
      <Command.Empty>No conversations found</Command.Empty>
      {conversations.map((conversation) => (
        <ConversationOption
          key={conversation._id}
          conversation={conversation}
          selected={selectedId === conversation._id}
          onSelect={() => onSelect(conversation._id)}
        />
      ))}
    </Command.List>
  </Command>
);

const ForwardMessageDialogContent = ({
  preview,
  conversations,
  conversationsLoading,
  selectedId,
  loading,
  form,
  onForward,
  onCancel,
  retryCount,
}: {
  preview: string;
  conversations: IConversation[];
  conversationsLoading: boolean;
  selectedId: string;
  loading: boolean;
  form: UseFormReturn<ForwardMessageForm>;
  onForward: (values: ForwardMessageForm) => Promise<void>;
  onCancel: () => void;
  retryCount?: number;
}) => (
  <Dialog.Content className="max-w-lg">
    <Dialog.Header>
      <Dialog.Title>Forward message</Dialog.Title>
      <Dialog.Description>
        Choose another conversation. erxes keeps a snapshot of the forwarded
        message.
      </Dialog.Description>
    </Dialog.Header>
    <div className="rounded-md border-l-2 border-primary bg-muted px-3 py-2 text-sm text-muted-foreground">
      <div className="line-clamp-3">{preview}</div>
    </div>
    <ForwardConversationList
      conversations={conversations}
      loading={conversationsLoading}
      selectedId={selectedId}
      onSelect={(conversationId) =>
        form.setValue('destinationId', conversationId, {
          shouldValidate: true,
        })
      }
    />
    <Input
      {...form.register('note')}
      disabled={retryCount !== undefined}
      placeholder="Add a note (optional)"
    />
    {retryCount !== undefined && (
      <p className="text-sm text-muted-foreground">
        {retryCount > 0
          ? `${retryCount} attachment(s) remain. The text and delivered files will not be sent again.`
          : 'This message has already been delivered.'}
      </p>
    )}
    <Dialog.Footer>
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        type="button"
        disabled={!selectedId || loading || retryCount === 0}
        onClick={form.handleSubmit(onForward)}
      >
        {loading && <Spinner size="sm" />}{' '}
        {retryCount === undefined ? 'Forward' : 'Retry attachments'}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
);

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
  const text = stripHtml(content)
    .replace(/^(?:(?:↪\s*)?Forwarded(?: message)?\s*)+/i, '')
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
  const form = useForm<ForwardMessageForm>({
    resolver: zodResolver(forwardMessageSchema),
    defaultValues: { destinationId: '', note: '' },
  });
  const [remainingByDestination, setRemainingByDestination] = useState<
    Record<string, IAttachment[]>
  >({});
  const selectedId = form.watch('destinationId');
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

  const handleForward = async ({ destinationId, note }: ForwardMessageForm) => {
    if (loading || remainingByDestination[destinationId]?.length === 0) return;
    const existingSnapshot = message.extraData?.forwardedSnapshot;
    const messageText = stripHtml(stripForwardedMarkers(message.content));
    const hasSocialShare = message.attachments?.some(
      (attachment: IAttachment) =>
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
      (attachment: IAttachment) => ({
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
    const forwardedBody =
      forwardedText || (forwardAttachments.length === 0 ? preview : '');
    const content = [note.trim(), '↪ Forwarded', forwardedBody]
      .filter(Boolean)
      .join('\n');
    const retryAttachments = remainingByDestination[destinationId];
    const outgoingAttachments = retryAttachments || forwardAttachments;
    try {
      const result = await addConversationMessage({
        variables: {
          conversationId: destinationId,
          content: retryAttachments ? '' : content,
          attachments: outgoingAttachments,
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
          'FacebookConversationMessages',
        ],
      });
      const delivery =
        result.data?.conversationMessageAdd.extraData?.facebookDelivery;
      if (delivery?.status === 'partial') {
        const remaining = outgoingAttachments.filter(
          ({ url }) => !delivery.sentAttachmentUrls.includes(url),
        );
        setRemainingByDestination((current) => ({
          ...current,
          [destinationId]: remaining,
        }));
        toast({
          title: remaining.length
            ? 'Message partially forwarded'
            : 'Message forwarded with a warning',
          description: remaining.length
            ? 'Retry will send only the remaining attachments.'
            : 'Facebook accepted the message, but saving its history failed. Do not resend it.',
          variant: 'destructive',
        });
        return;
      }
      if (retryAttachments) {
        setRemainingByDestination((current) => ({
          ...current,
          [destinationId]: [],
        }));
      }
      toast({ title: 'Message forwarded', variant: 'default' });
      form.reset();
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
      <ForwardMessageDialogContent
        preview={preview}
        conversations={conversations}
        conversationsLoading={conversationsLoading}
        selectedId={selectedId}
        loading={loading}
        retryCount={remainingByDestination[selectedId]?.length}
        form={form}
        onForward={handleForward}
        onCancel={() => onOpenChange(false)}
      />
    </Dialog>
  );
};
