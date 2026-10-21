import { Skeleton } from 'erxes-ui';

export const ConversationsLoading = () => (
  <div className="divide-y" aria-label="Loading conversations">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="flex items-start gap-3 px-4 py-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    ))}
  </div>
);
