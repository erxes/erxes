import { cn, Filter, Skeleton } from 'erxes-ui';
import { useConversationListContext } from '../hooks/useConversationListContext';
import { ConversationFilterBar } from '@/inbox/conversations/components/ConversationsFilter';

export const ConversationsHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Filter id="conversations-filter-bar">
      <div className="pl-6 pr-4 py-2 space-y-1 bg-sidebar">
        <div className="flex items-center justify-between">
          {children}
          <ConversationCount />
        </div>
        <ConversationFilterBar />
        <Filter.Dialog>
          <Filter.DialogDateView filterKey="created" />
        </Filter.Dialog>
      </div>
    </Filter>
  );
};

export const ConversationCount = ({ className }: { className?: string }) => {
  const { totalCount, loading } = useConversationListContext();

  return (
    <span
      className={cn(
        'text-accent-foreground inline-flex items-center gap-1 text-sm font-medium ml-auto truncate',
        className,
      )}
    >
      {loading ? <Skeleton className="w-4 h-4" /> : totalCount} conversations
    </span>
  );
};
