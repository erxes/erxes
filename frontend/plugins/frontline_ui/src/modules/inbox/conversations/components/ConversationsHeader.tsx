import { cn, Filter, Skeleton } from 'erxes-ui';
import { useConversationListContext } from '../hooks/useConversationListContext';
import { ConversationFilterBar } from '@/inbox/conversations/components/ConversationsFilter';
import { useTranslation } from 'react-i18next';

export const ConversationsHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Filter id="conversations-filter-bar">
      <div className="pl-6 pr-4 py-2 space-y-1 bg-sidebar">
        <div className="flex items-center justify-between gap-2 min-w-0">
          {children}
          <ConversationCount />
        </div>
        <ConversationFilterBar />
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
          <Filter.View filterKey="created" inDialog>
            <Filter.DialogDateView filterKey="created" />
          </Filter.View>
        </Filter.Dialog>
      </div>
    </Filter>
  );
};

export const ConversationCount = ({ className }: { className?: string }) => {
  const { t } = useTranslation('frontline');
  const { totalCount, loading } = useConversationListContext();

  return (
    <span
      className={cn(
        'text-accent-foreground inline-flex items-center gap-1 text-sm font-medium ml-auto min-w-0',
        className,
      )}
    >
      {loading ? (
        <Skeleton className="w-4 h-4 flex-none" />
      ) : (
        <span className="flex-none">{totalCount}</span>
      )}
      <span className="truncate">{t('conversations')}</span>
    </span>
  );
};
