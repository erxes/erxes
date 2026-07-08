import { SelectMember } from 'ui-modules';
import { useAtom } from 'jotai';
import { selectConversationsState } from '../states/selectConversationsState';
import { useAssignConversations } from '../hooks/useAssignConversations';
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
        });
      }}
      placeholder={t('select-assignee')}
    />
  );
};
