import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';
import { Separator, useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';

export const InboxLayout = ({
  conversations,
  conversationDetail,
}: {
  conversations: React.ReactNode;
  conversationDetail: React.ReactNode;
}) => {
  const inboxLayout = useAtomValue(inboxLayoutState);
  const [conversationId] = useQueryState('conversationId');

  if (inboxLayout === 'list') {
    return conversationId ? conversationDetail : conversations;
  }

  return (
    <div className="flex flex-auto overflow-hidden">
      <div className="min-w-0 w-72 flex-none overflow-hidden">
        {conversations}
      </div>
      <Separator orientation="vertical" />
      <div className="min-w-0 flex-auto">{conversationDetail}</div>
    </div>
  );
};
