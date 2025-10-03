import { useQuery } from '@apollo/client';
import { IMAP_CONVERSATION_DETAIL_QUERY } from '../graphql/queries/imapQueries';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';

export const ImapConversationDetail = () => {
  const { _id } = useConversationContext();

  const { data } = useQuery(IMAP_CONVERSATION_DETAIL_QUERY, {
    variables: { conversationId: _id },
  });

  return <div>IMapConversationDetail</div>;
};
