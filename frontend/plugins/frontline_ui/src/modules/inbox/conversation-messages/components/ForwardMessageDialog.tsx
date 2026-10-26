import { Button, Command, Dialog, Input, Spinner, stripHtml } from 'erxes-ui';

import type { IConversation } from '@/inbox/types/Conversation';
import type { ForwardMessageDialogProps } from '@/inbox/conversation-messages/types/forwardMessage';
import { useForwardMessage } from '@/inbox/conversation-messages/hooks/useForwardMessage';
import { useTranslation } from 'react-i18next';

const ConversationOption = ({
  conversation,
  selected,
  onSelect,
}: {
  conversation: IConversation;
  selected: boolean;
  onSelect: () => void;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
  const customer = conversation.customer;
  const name =
    [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') ||
    conversation.integration?.name ||
    t('conversation');

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
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
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
        <Dialog.Title>{t('forward-message')}</Dialog.Title>
        <Dialog.Description>
          {t('forward-message-description')}
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
        placeholder={t('forward-note-placeholder')}
      />
      {retryCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          {retryCount > 0
            ? t('forward-attachments-remain', { count: retryCount })
            : t('message-already-delivered')}
        </p>
      )}
      <Dialog.Footer>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
        >
          {t('cancel')}
        </Button>
        <Button
          type="button"
          disabled={!selectedId || loading || retryCount === 0}
          onClick={form.handleSubmit(handleForward)}
        >
          {loading && <Spinner size="sm" />}{' '}
          {retryCount === undefined ? t('forward') : t('retry-attachments')}
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
