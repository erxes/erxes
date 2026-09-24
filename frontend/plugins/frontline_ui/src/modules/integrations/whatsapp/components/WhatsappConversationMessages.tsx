import { memo, useMemo } from 'react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { WhatsappMessengerMessageContext } from '../context/WhatsappMessengerMessageContext';
import { useWhatsappConversationMessages } from '../hooks/useWhatsappConversationMessages';
import { IWhatsappConversationMessage } from '../types/WhatsappTypes';
import { WhatsappListError } from './WhatsappListError';
import { WhatsappMessengerMessage } from './WhatsappMessengerMessages';

const WhatsappConversationMessageItem = memo(
  function WhatsappConversationMessageItem({
    message,
    previousMessage,
    nextMessage,
  }: {
    message: IWhatsappConversationMessage;
    previousMessage?: IWhatsappConversationMessage;
    nextMessage?: IWhatsappConversationMessage;
  }) {
    const contextValue = useMemo(
      () => ({ ...message, previousMessage, nextMessage }),
      [message, previousMessage, nextMessage],
    );

    return (
      <WhatsappMessengerMessageContext.Provider value={contextValue}>
        <WhatsappMessengerMessage />
      </WhatsappMessengerMessageContext.Provider>
    );
  },
);

export const WhatsappConversationMessages = () => {
  const { t } = useTranslation('frontline');
  const {
    whatsappConversationMessages,
    handleFetchMore,
    totalCount,
    loading,
    error,
    refetch,
  } = useWhatsappConversationMessages();

  const messages = whatsappConversationMessages || [];

  if (error && messages.length === 0 && !loading) {
    return (
      <WhatsappListError
        title={t('failed-to-load-messages', 'Failed to load messages')}
        error={error}
        onRetry={() => refetch()}
        className="h-full bg-muted/20"
      />
    );
  }

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={messages.length}
      totalCount={totalCount}
      loading={loading}
    >
      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
          <span className="text-destructive">
            {t('failed-to-load-messages', 'Failed to load messages')}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            {t('retry', 'Retry')}
          </Button>
        </div>
      )}
      {messages.map((message, index) => (
        <WhatsappConversationMessageItem
          key={message._id}
          message={message}
          previousMessage={messages[index - 1]}
          nextMessage={messages[index + 1]}
        />
      ))}
    </InboxMessagesContainer>
  );
};
