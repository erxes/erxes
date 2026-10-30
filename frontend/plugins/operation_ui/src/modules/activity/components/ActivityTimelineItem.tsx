import { RelativeDateDisplay } from 'erxes-ui';
import { ReactNode } from 'react';

interface ActivityTimelineItemProps {
  avatar: ReactNode;
  children: ReactNode;
  createdAt?: string;
  id?: string;
}

export const ActivityTimelineItem = ({
  avatar,
  children,
  createdAt,
  id,
}: ActivityTimelineItemProps) => {
  return (
    <div className="flex min-w-0 gap-2">
      <div className="size-5 shrink-0 -ml-2.5 mt-0.5 shadow-xs rounded-full bg-background relative flex items-center justify-center">
        {avatar}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-xs leading-5 [overflow-wrap:anywhere]">
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1">
          {children}
        </div>
        {createdAt && (
          <RelativeDateDisplay value={createdAt} key={id} asChild>
            <div className="text-muted-foreground cursor-default">
              <RelativeDateDisplay.Value value={createdAt} />
            </div>
          </RelativeDateDisplay>
        )}
      </div>
    </div>
  );
};
