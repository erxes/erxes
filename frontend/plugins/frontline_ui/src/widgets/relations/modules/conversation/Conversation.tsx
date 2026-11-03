import { useConversations } from '@/inbox/conversations/hooks/useConversations';
import { getHostContacts, IRelationWidgetProps } from 'ui-modules';
import { ConversationRelationDetails } from './ConversationDetails';
import { ConversationReportContent } from '@/inbox/conversations/conversation-detail/components/ConversationReportContent';

// Conversations belong to a customer by `customerId`, not by relation, so a
// contact's conversations are read from the inbox directly.
const CustomerConversations = ({
  customerId,
  excludeIds,
}: {
  customerId: string;
  excludeIds: string[];
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

  return <>{items}</>;
};

/**
 * The conversations of the host's customer (the host itself when it is
 * one): conversations keep their customer in `customerId`. No relation is
 * read; a ticket keeps the conversations it was made from itself.
 */
export const ConversationRelationWidget = ({
  contentId,
  contentType,
  customerId,
  customerIds,
}: IRelationWidgetProps) => {
  const hostCustomerId = getHostContacts({
    contentType,
    contentId,
    customerId,
    customerIds,
  }).customerId;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto h-full gap-2 w-full p-2">
      <ConversationReportContent customerId={hostCustomerId} />
      {hostCustomerId && (
        <CustomerConversations
          customerId={hostCustomerId}
          excludeIds={[contentId]}
        />
      )}
    </div>
  );
};
