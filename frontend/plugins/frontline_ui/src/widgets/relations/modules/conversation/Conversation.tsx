import { useConversations } from '@/inbox/conversations/hooks/useConversations';
import {
  getWidgetContacts,
  IRelationWidgetProps,
  RelationWidgetContactsSection,
  useRelations,
} from 'ui-modules';
import { ConversationRelationDetails } from './ConversationDetails';
import { ConversationReportContent } from '@/inbox/conversations/conversation-detail/components/ConversationReportContent';

// Conversations belong to a customer by `customerId`, not by relation, so a
// contact's conversations are read from the inbox directly.
const CustomerConversations = ({
  customerId,
  excludeIds,
  asContactSection,
}: {
  customerId: string;
  excludeIds: string[];
  asContactSection?: boolean;
}) => {
  const { conversations } = useConversations({
    variables: { customerId },
  });

  const items = (conversations || [])
    .filter((conversation) => !excludeIds.includes(conversation._id))
    .map((conversation) => (
      <ConversationRelationDetails
        key={conversation._id}
        conversationId={conversation._id}
      />
    ));

  if (!asContactSection) {
    return <>{items}</>;
  }

  if (!items.length) {
    return null;
  }

  return <RelationWidgetContactsSection>{items}</RelationWidgetContactsSection>;
};

export const ConversationRelationWidget = ({
  contentId,
  contentType,
  customerId,
  customerIds,
}: IRelationWidgetProps) => {
  const isCustomerScoped =
    contentType === 'core:customer' || contentType === 'frontline:conversation';

  const { relatedIds } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'frontline:conversation',
    },
    skip: isCustomerScoped,
  });

  if (isCustomerScoped) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto h-full gap-2 w-full p-2">
        <ConversationReportContent customerId={customerId} />
        <CustomerConversations
          customerId={customerId || contentId}
          excludeIds={[contentId]}
        />
      </div>
    );
  }

  const contactCustomerIds = getWidgetContacts({
    customerId,
    customerIds,
  }).customerIds;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto h-full gap-2 w-full p-2">
      <ConversationReportContent customerId={customerId} />
      {relatedIds.map((conversationId) => (
        <ConversationRelationDetails
          key={conversationId}
          conversationId={conversationId}
        />
      ))}
      {contactCustomerIds.map((contactCustomerId) => (
        <CustomerConversations
          key={contactCustomerId}
          customerId={contactCustomerId}
          excludeIds={relatedIds}
          asContactSection
        />
      ))}
    </div>
  );
};
