import { callConversationNoteContext } from '../context/conversationNoteContext';
import { useCallConversationNotes } from '@/integrations/call/hooks/useCallConversationNotes';
import { InboxMessagesContainer } from '@/inbox/components/InboxMessagesContainer';
import { InternalNotes } from '@/integrations/call/components/InternalNotes';

export const CallConversationNotes = () => {
  const {
    callConversationNotes,
    conversationId,
    handleFetchMore,
    hasMore,
    loading,
  } = useCallConversationNotes();
  const notesCount = callConversationNotes?.length || 0;

  return (
    <InboxMessagesContainer
      fetchMore={handleFetchMore}
      messagesLength={notesCount}
      totalCount={hasMore ? notesCount + 1 : notesCount}
      loading={loading}
      conversationId={conversationId ?? undefined}
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
