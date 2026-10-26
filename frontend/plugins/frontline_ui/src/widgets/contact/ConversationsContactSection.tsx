import { useConversations } from '@/inbox/conversations/hooks/useConversations';
import { IconMail } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContactWidgetSection, IContactWidgetProps } from 'ui-modules';
import { ConversationRelationDetails } from '~/widgets/relations/modules/conversation/ConversationDetails';

// A customer's conversations (a conversation keeps its customer itself, so
// they are read from the inbox); clicking one opens it in a sheet.
export const ConversationsContactSection = ({
  contentType,
  contentId,
}: Omit<IContactWidgetProps, 'module'>) => {
  const { t } = useTranslation('frontline');
  const isCustomer = contentType === 'core:customer';
  const { conversations, loading } = useConversations({
    variables: { customerId: contentId },
    skip: !isCustomer,
  });

  if (!isCustomer) {
    return null;
  }

  return (
    <ContactWidgetSection
      icon={IconMail}
      label={t('conversations', 'Conversations')}
      ids={(conversations || []).map((conversation) => conversation._id)}
      loading={loading}
      renderItem={(conversationId) => (
        <ConversationRelationDetails conversationId={conversationId} />
      )}
    />
  );
};
