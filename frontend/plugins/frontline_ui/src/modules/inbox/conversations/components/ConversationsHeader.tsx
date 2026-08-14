import { cn, Filter, Skeleton } from 'erxes-ui';
import { useConversationListContext } from '@/inbox/conversations/hooks/useConversationListContext';
import { ConversationFilterBar } from '@/inbox/conversations/components/ConversationsFilter';
import { useInboxLayout } from '@/inbox/hooks/useInboxLayout';
import { useTranslation } from 'react-i18next';

export const ConversationsHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const inboxLayout = useInboxLayout();

  return (
    <Filter id="conversations-filter-bar">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden bg-sidebar py-2 pl-6 pr-4">
        <div className="order-1 flex shrink-0 items-center">{children}</div>
        <ConversationFilterBar
          className={cn(
            'order-3 basis-full',
            inboxLayout === 'list' && 'md:order-2 md:basis-0',
          )}
        />
        <ConversationCount
          className={cn(
            'order-2 shrink-0',
            inboxLayout === 'list' && 'md:order-3',
          )}
        />
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
