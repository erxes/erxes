import { callConversationNoteContext } from '../context/conversationNoteContext';
import { useCallConversationNotes } from '@/integrations/call/hooks/useCallConversationNotes';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { InternalNotes } from '@/integrations/call/components/InternalNotes';

export const CallConversationNotes = () => {
  const { callConversationNotes, handleFetchMore, loading } =
    useCallConversationNotes();

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={callConversationNotes?.length || 0}
      totalCount={callConversationNotes?.length || 0}
      loading={loading}
    >
      {callConversationNotes?.map((message) => (
        <callConversationNoteContext.Provider
          value={{
            ...message,
            previousMessage:
              callConversationNotes[callConversationNotes.indexOf(message) - 1],
            nextMessage:
              callConversationNotes[callConversationNotes.indexOf(message) + 1],
          }}
          key={message._id}
        >
          <InternalNotes />
        </callConversationNoteContext.Provider>
      ))}
    </InboxMessagesContainer>
  );
};
