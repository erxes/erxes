import { Button, Command, Dialog, Input, Spinner, stripHtml } from 'erxes-ui';

import type { IConversation } from '@/inbox/types/Conversation';
import type { ForwardMessageDialogProps } from '@/inbox/conversation-messages/types/forwardMessage';
import { useForwardMessage } from '@/inbox/conversation-messages/hooks/useForwardMessage';

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
  open,
  onOpenChange,
}: ForwardMessageDialogProps) => {
  const {
    form,
    preview,
    conversations,
    conversationsLoading,
    selectedId,
    loading,
    retryCount,
    handleForward,
  } = useForwardMessage(open, onOpenChange);

  return (
    <Dialog.Content className="max-w-lg">
      <Dialog.Header>
        <Dialog.Title>Forward message</Dialog.Title>
        <Dialog.Description>
          Choose another conversation. erxes keeps a snapshot of the forwarded
          message. Instagram recipients receive the note, text, and attachments,
          but not the snapshot metadata.
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
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!selectedId || loading || retryCount === 0}
          onClick={form.handleSubmit(handleForward)}
        >
          {loading && <Spinner size="sm" />}{' '}
          {retryCount === undefined ? 'Forward' : 'Retry attachments'}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  );
};

export const ForwardMessageDialog = ({
  open,
  onOpenChange,
}: ForwardMessageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ForwardMessageDialogContent open={open} onOpenChange={onOpenChange} />
    </Dialog>
  );
};
