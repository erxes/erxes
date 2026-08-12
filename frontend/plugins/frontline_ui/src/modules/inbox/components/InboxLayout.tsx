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
      <div className="flex-auto min-h-0">
        {conversationId ? conversationDetail : conversations}
      </div>
    );
  }

  return (
    <div className="flex flex-auto min-h-0 overflow-hidden">
      <div className="flex-none w-72">{conversations}</div>
      <Separator orientation="vertical" />
      <div className="flex-auto min-h-0">{conversationDetail}</div>
    </div>
  );
};
