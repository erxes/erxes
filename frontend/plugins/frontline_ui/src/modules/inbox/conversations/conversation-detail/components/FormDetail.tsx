import { ScrollArea, Skeleton, useQueryState } from 'erxes-ui';
import { IMessage } from '@/inbox/types/Conversation';
import React from 'react';
import { ConversationFormDisplay } from '@/inbox/conversation-messages/components/ConversationFormDisplay';
import { InternalNoteDisplay } from 'ui-modules';
import { MessageInput } from './MessageInput';
import { ConversationDetailLayout } from './ConversationDetailLayout';
import { useFormWidgetData } from '../hooks/useFormWidgetData';

export const FormDetailMessages = () => {
  const [conversationId] = useQueryState('conversationId');

  const { conversationMessages, loading } = useFormWidgetData({
    variables: { conversationId, limit: 10 },
  });

  if (loading) {
    return <Skeleton className="h-full" />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto w-[648px] p-6 flex flex-col gap-6">
        {conversationMessages.map((message: IMessage) => (
          <React.Fragment key={message._id}>
            {message.formWidgetData ? (
              <ConversationFormDisplay {...message} />
            ) : (
              <InternalNoteDisplay content={message.content} />
            )}
          </React.Fragment>
        ))}
      </div>
      <ScrollArea.Bar orientation="horizontal" />
    </ScrollArea>
  );
};

export const ConversationFormDetail = () => {
  return (
    <ConversationDetailLayout input={<MessageInput />}>
      <FormDetailMessages />
    </ConversationDetailLayout>
  );
};
