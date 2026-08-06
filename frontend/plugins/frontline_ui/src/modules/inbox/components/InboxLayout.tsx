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
    return (
      <div className="min-h-0 flex-1 overflow-hidden">
        {conversationId ? conversationDetail : conversations}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="h-full min-h-0 w-72 flex-none overflow-hidden">
        {conversations}
      </div>
      <Separator orientation="vertical" />
      <div className="min-h-0 min-w-0 flex-auto overflow-hidden">
        {conversationDetail}
      </div>
    </div>
  );
};
