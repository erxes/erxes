import { useConversations } from '@/inbox/conversations/hooks/useConversations';
import { IconMessageOff } from '@tabler/icons-react';
import { Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IRelationWidgetProps, useRelations } from 'ui-modules';
import { ConversationRelationDetails } from './ConversationDetails';
import { ConversationReportContent } from '@/inbox/conversations/conversation-detail/components/ConversationReportContent';

const ConversationWidgetHeader = () => {
  const { t } = useTranslation('frontline');
  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between">
        <span className="font-medium text-primary">
          {t('conversations', 'Conversations')}
        </span>
      </div>
      <Separator />
    </>
  );
};

export const ConversationRelationWidget = ({
  contentId,
  contentType,
  customerId,
}: IRelationWidgetProps) => {
  const { t } = useTranslation('frontline');
  const { ownEntities } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'frontline:conversation',
    },
    skip:
      contentType === 'core:customer' ||
      contentType === 'frontline:conversation',
  });

  const { conversations } = useConversations({
    variables: {
      customerId: customerId || contentId,
    },
    skip:
      contentType !== 'core:customer' &&
      contentType !== 'frontline:conversation',
  });

  if (
    contentType === 'core:customer' ||
    contentType === 'frontline:conversation'
  ) {
    return (
      <>
        <ConversationWidgetHeader />
        <div className="flex flex-col flex-1 overflow-y-auto h-full gap-2 w-full p-4">
          <ConversationReportContent customerId={customerId} />
          {conversations
            ?.filter((conversation) => conversation._id !== contentId)
            .map((conversation) => {
              return (
                <ConversationRelationDetails
                  key={conversation._id}
                  conversationId={conversation._id}
                />
              );
            })}
        </div>
      </>
    );
  }

  const showReport = contentType !== 'frontline:ticket';
  const relatedConversations = ownEntities?.filter(
    (entity) => entity.contentType === 'frontline:conversation',
  );

  if (!showReport && relatedConversations?.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconMessageOff />
        </div>
        <span className="text-sm">
          {t(
            'no-conversations-to-display',
            'No conversations to display at the moment.',
          )}
        </span>
      </div>
    );
  }

  return (
    <>
      <ConversationWidgetHeader />
      <div className="flex flex-col flex-1 overflow-y-auto h-full gap-2 w-full p-4">
        {showReport && <ConversationReportContent customerId={customerId} />}
        {relatedConversations?.map((entity) => {
          return (
            <ConversationRelationDetails
              key={entity.contentId}
              conversationId={entity.contentId}
            />
          );
        })}
      </div>
    </>
  );
};
