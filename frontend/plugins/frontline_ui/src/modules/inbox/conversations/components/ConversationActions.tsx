import { IconCheckbox } from '@tabler/icons-react';
import { Button, Checkbox, CommandBar, Separator } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useConversationListContext } from '@/inbox/conversations/hooks/useConversationListContext';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ReplaceAssignee } from '@/inbox/conversations/components/ReplaceAssignee';
import { selectConversationsState } from '@/inbox/conversations/states/selectConversationsState';
import { FilterConversationsPopover } from '@/inbox/conversations/components/ConversationsFilter';
import { ConversationTag } from './ConversationTag';
import { ConversationDisplay } from './ConversationDisplay';
import { ConversationRefetch } from './ConversationRefetch';

export const ConversationActions = () => {
  return (
    <>
      <div className="flex items-center gap-1">
        <ConversationSelectAll />
        <ConversationRefetch />
        <FilterConversationsPopover />
        <ConversationDisplay />
      </div>
      <ConversationsCommandBar />
    </>
  );
};

export const ConversationSelectAll = () => {
  const { conversations } = useConversationListContext();
  const [selectedConversations, setSelectedConversations] = useAtom(
    selectConversationsState,
  );
  const [searchParams] = useSearchParams();

  // Reset selection when search params change
  useEffect(() => {
    setSelectedConversations([]);
  }, [searchParams, setSelectedConversations]);

  const isAllSelected =
    conversations?.length > 0 &&
    selectedConversations.length === conversations?.length;
  const isSomeSelected = selectedConversations.length > 0;

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      const conversationIds = conversations.map(
        (conversation) => conversation._id,
      );
      setSelectedConversations(conversationIds);
    } else {
      setSelectedConversations([]);
    }
  };

  return (
    <Checkbox
      checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
      onCheckedChange={handleCheckboxChange}
      className="mx-2"
    />
  );
};

export const ConversationsCommandBar = () => {
  const [selectedConversations, setSelectedConversations] = useAtom(
    selectConversationsState,
  );
  return (
    <CommandBar open={selectedConversations.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => setSelectedConversations([])}>
          {selectedConversations.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ReplaceAssignee />
        <ConversationTag conversationIds={selectedConversations} />
        <Button variant="secondary">
          <IconCheckbox />
          Resolve All
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
