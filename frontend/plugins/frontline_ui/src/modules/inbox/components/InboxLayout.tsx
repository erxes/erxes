import { useConversationListVisibility } from '@/inbox/hooks/useConversationListVisibility';
import { useInboxLayout } from '@/inbox/hooks/useInboxLayout';
import { Resizable, cn, useQueryState } from 'erxes-ui';

export const InboxLayout = ({
  conversations,
  conversationDetail,
}: {
  conversations: React.ReactNode;
  conversationDetail: React.ReactNode;
}) => {
  const inboxLayout = useInboxLayout();
  const { isHidden } = useConversationListVisibility();
  const [conversationId] = useQueryState('conversationId');

  if (inboxLayout === 'list') {
    return conversationId ? conversationDetail : conversations;
  }

  // The toggle lives in the conversation header, and CSS keeps the list mounted.
  const collapseConversations = isHidden && !!conversationId && 'hidden';

  return (
    <Resizable.PanelGroup
      direction="horizontal"
      autoSaveId="frontline-inbox-split"
      className="flex-1 overflow-hidden"
    >
      <Resizable.Panel
        defaultSize={24}
        minSize={16}
        maxSize={40}
        className={cn('min-w-56 max-w-md', collapseConversations)}
      >
        {conversations}
      </Resizable.Panel>
      <Resizable.Handle
        className={cn(
          'transition-colors duration-150 hover:bg-primary/40 data-[resize-handle-state=drag]:bg-primary/60',
          collapseConversations,
        )}
      />
      <Resizable.Panel defaultSize={76} minSize={40} className="min-w-0">
        {conversationDetail}
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
