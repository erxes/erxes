import { useEffect, useState } from 'react';
import { MessageItem } from './MessageItem';
import { IMessage } from '@/inbox/types/Conversation';
import { useConversationMessages } from '@/inbox/conversation-messages/hooks/useConversationMessages';
import { useConversationTypingStatus } from '@/inbox/conversation-messages/hooks/useConversationTypingStatus';
import { TypingIndicator } from '@/inbox/conversation-messages/components/TypingIndicator';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { useQuery } from '@apollo/client';
import { Button, DropdownMenu } from 'erxes-ui';
import { IconPin } from '@tabler/icons-react';
import { GET_CONVERSATION_PINNED_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationPinnedMessages';

const plainText = (content?: string) =>
  content
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Message';

export const ConversationMessages = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const [pendingReplyTarget, setPendingReplyTarget] = useState<string>();
  const { data: pinnedData } = useQuery<{
    conversationPinnedMessages: IMessage[];
  }>(GET_CONVERSATION_PINNED_MESSAGES, {
    variables: { conversationId },
    fetchPolicy: 'cache-and-network',
    pollInterval: 30_000,
  });
  const pinnedMessages = pinnedData?.conversationPinnedMessages || [];
  const { messages, loading, handleFetchMore, totalCount } =
    useConversationMessages({
      variables: {
        conversationId,
        limit: 10,
        skip: 0,
      },
      fetchPolicy: 'cache-and-network',
    });

  const { typingNames, clearTypist } =
    useConversationTypingStatus(conversationId);

  const lastMessage = messages?.[messages.length - 1];
  useEffect(() => {
    clearTypist(lastMessage?.customerId);
  }, [lastMessage?._id, lastMessage?.customerId, clearTypist]);

  useEffect(() => {
    const handleReplyJump = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      if (target) setPendingReplyTarget(target);
    };
    window.addEventListener('frontline:jump-to-message', handleReplyJump);
    return () =>
      window.removeEventListener('frontline:jump-to-message', handleReplyJump);
  }, []);

  useEffect(() => {
    if (!pendingReplyTarget) return;
    const escaped = CSS.escape(pendingReplyTarget);
    const target =
      document.querySelector<HTMLElement>(
        `[data-provider-message-id="${escaped}"]`,
      ) ||
      document.getElementById(`conversation-message-${pendingReplyTarget}`);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.animate(
        [
          { backgroundColor: 'transparent' },
          { backgroundColor: 'hsl(var(--accent))' },
          { backgroundColor: 'transparent' },
        ],
        { duration: 900 },
      );
      setPendingReplyTarget(undefined);
      return;
    }

    if (!loading && messages.length < totalCount) {
      handleFetchMore();
    } else if (!loading) {
      setPendingReplyTarget(undefined);
    }
  }, [
    handleFetchMore,
    loading,
    messages.length,
    pendingReplyTarget,
    totalCount,
  ]);

  const isGroupConversation =
    new Set((messages || []).map((m: IMessage) => m.customerId).filter(Boolean))
      .size > 1;

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={messages?.length || 0}
      totalCount={totalCount}
      loading={loading}
    >
      {pinnedMessages.length > 0 && (
        <div className="sticky top-2 z-20 mb-2 flex justify-center">
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary" size="sm" className="shadow-sm">
                <IconPin className="size-4" /> {pinnedMessages.length} pinned
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="max-h-72 w-80 overflow-y-auto">
              {pinnedMessages.map((message) => (
                <DropdownMenu.Item
                  key={message._id}
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('frontline:jump-to-message', {
                        detail:
                          message.providerData?.messageId ||
                          message.extraData?.discordMessageId ||
                          message._id,
                      }),
                    )
                  }
                >
                  <IconPin className="size-4" />
                  <span className="truncate">{plainText(message.content)}</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
      )}
      {messages?.map((message: IMessage, index: number) => (
        <ConversationMessageContext.Provider
          value={{
            ...message,
            conversationId: message.conversationId || conversationId,
            previousMessage: messages[index - 1],
            nextMessage: messages[index + 1],
            isGroupConversation,
          }}
          key={message._id}
        >
          <MessageItem />
        </ConversationMessageContext.Provider>
      ))}
      <TypingIndicator names={typingNames} />
    </InboxMessagesContainer>
  );
};
