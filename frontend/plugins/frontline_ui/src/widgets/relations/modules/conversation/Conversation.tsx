import { useConversations } from '@/inbox/conversations/hooks/useConversations';
import { IRelationWidgetProps, useRelations } from 'ui-modules';
import { ConversationRelationDetails } from './ConversationDetails';

export const ConversationRelationWidget = ({
  contentId,
  contentType,
  customerId,
}: IRelationWidgetProps) => {
  const { ownEntities } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'frontline:conversation',
    },
    skip: contentType === 'core:customer',
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
      <div className="flex flex-col flex-1 overflow-hidden h-full gap-2 w-full p-2">
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
    );
  }
  return (
    <div className="flex flex-col flex-1 overflow-y-auto gap-2 w-full p-2">
      {ownEntities?.map((entity) => {
        return (
          <ConversationRelationDetails
            key={entity.contentId}
            conversationId={entity.contentId}
          />
        );
      })}
    </div>
  );
};
