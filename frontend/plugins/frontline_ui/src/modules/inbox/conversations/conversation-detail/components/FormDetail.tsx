import { Empty, ScrollArea, Skeleton, useQueryState } from 'erxes-ui';
import { IMessage } from '@/inbox/types/Conversation';
import React from 'react';
import { ConversationFormDisplay } from '@/inbox/conversation-messages/components/ConversationFormDisplay';
import { InternalNoteDisplay } from 'ui-modules';
import { MessageInput } from '@/inbox/conversations/conversation-detail/components/MessageInput';
import { ConversationDetailLayout } from '@/inbox/conversations/conversation-detail/components/ConversationDetailLayout';
import { useFormWidgetData } from '@/inbox/conversations/conversation-detail/hooks/useFormWidgetData';
import { IconForms } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const FormDetailMessages = () => {
  const { t } = useTranslation('frontline');
  const [conversationId] = useQueryState('conversationId');

  const { conversationMessages, loading } = useFormWidgetData({
    variables: { conversationId, limit: 10 },
  });

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!conversationMessages?.length) {
    return (
      <Empty className="h-full rounded-none border-0 bg-muted/20">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconForms />
          </Empty.Media>
          <Empty.Title>
            {t('no-form-responses', {
              defaultValue: 'No form responses yet',
            })}
          </Empty.Title>
          <Empty.Description>
            {t('form-responses-empty-description', {
              defaultValue: 'Submitted form details will appear here.',
            })}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-6 md:px-6">
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
  const [conversationId] = useQueryState('conversationId');

  return (
    <ConversationDetailLayout
      input={<MessageInput conversationId={conversationId as string} />}
    >
      <FormDetailMessages />
    </ConversationDetailLayout>
  );
};
