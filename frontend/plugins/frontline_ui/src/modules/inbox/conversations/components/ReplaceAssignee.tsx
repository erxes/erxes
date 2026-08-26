import { SelectMember } from 'ui-modules';
import { useAtom } from 'jotai';
import { selectConversationsState } from '@/inbox/conversations/states/selectConversationsState';
import { useAssignConversations } from '@/inbox/conversations/hooks/useAssignConversations';
import { useTranslation } from 'react-i18next';

export const ReplaceAssignee = () => {
  const { t } = useTranslation('frontline');
  const [selectedConversations] = useAtom(selectConversationsState);
  const { assignConversations } = useAssignConversations();

  return (
    <SelectMember
      onValueChange={(value) => {
        assignConversations({
          variables: {
            conversationIds: selectedConversations,
            assignedUserId: value,
          },
          refetchQueries: [
            'Conversations',
            'ConversationCounts',
            'FrontlineInboxSidebarWorkCounts',
            'GetMyChannels',
          ],
        });
      }}
      placeholder={t('select-assignee')}
    />
  );
};
