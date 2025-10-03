import { IconReplaceUser } from '@tabler/icons-react';
import { Button, Popover } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { useAtom } from 'jotai';
import { selectConversationsState } from '../states/selectConversationsState';
import { useAssignConversations } from '../hooks/useAssignConversations';

export const ReplaceAssignee = () => {
  const [selectedConversations, setSelectedConversations] = useAtom(
    selectConversationsState,
  );
  const { assignConversations } = useAssignConversations();

  return (
    <SelectMember
      onValueChange={(value) => {
        assignConversations({
          variables: {
            conversationIds: selectedConversations,
            assignedUserId: value,
          },
          onCompleted: () => setSelectedConversations([]),
        });
      }}
      placeholder="Select assignee"
    />
  );
};
