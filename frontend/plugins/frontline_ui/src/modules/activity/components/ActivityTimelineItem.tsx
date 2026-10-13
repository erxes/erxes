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
    <div className="inline-flex gap-1">
      <div className="size-5 -ml-2.5 mt-0.5 shadow-xs rounded-full bg-background relative flex items-center justify-center">
        {avatar}
      </div>
      <div className="inline-flex gap-1 text-sm leading-6 flex-wrap ml-1">
        {children}
        {createdAt && (
          <RelativeDateDisplay value={createdAt} key={id} asChild>
            <div className="text-accent-foreground ml-2 cursor-default">
              <RelativeDateDisplay.Value value={createdAt} />
            </div>
          </RelativeDateDisplay>
        )}
      </div>
    </div>
  );
};
