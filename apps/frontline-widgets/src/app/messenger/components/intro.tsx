import { Skeleton } from 'erxes-ui';
import { useGetMessengerSupporters } from '../hooks/useGetMessengerSupporters';
import { ConversationMessage, EmptyChat } from './conversation';
import { ChatInput } from './chat-input';
import { useConversations } from '../hooks/useConversations';

export const Intro = () => {
  const { loading: loadingSupporters } = useGetMessengerSupporters();
  const {
    conversations,
    loading: loadingConversations,
    lastMesseges,
  } = useConversations();

  if (loadingSupporters || loadingConversations) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-col justify-center p-4 font-medium text-sm flex-1 min-h-0">
          <div className="flex items-center gap-3">
            <Skeleton className="flex-none size-8 bg-muted rounded-full" />
            <Skeleton className="flex-1 h-10 bg-muted" />
          </div>
        </div>
        <ChatInput />
      </div>
    );
  }
  if (!conversations?.length) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-col justify-center p-4 font-medium text-sm flex-1 min-h-0">
          <EmptyChat />
        </div>
        <ChatInput />
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col p-4 font-medium text-sm flex-1 overflow-y-auto styled-scroll min-h-0">
        {lastMesseges &&
          lastMesseges?.map((messege, index) => (
            <ConversationMessage
              key={index}
              conversationId={conversations[index]?._id}
              message={messege || undefined}
            />
          ))}
      </div>
      <ChatInput />
    </div>
  );
};
