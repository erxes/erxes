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
      <div className="flex-none w-72">{conversations}</div>
      <Separator orientation="vertical" />
      <div className="flex-auto">{conversationDetail}</div>
    </div>
  );
};
