import { Empty, Skeleton } from 'erxes-ui';
import type { ReactNode } from 'react';

/**
 * The frame every home dashboard tile draws: a header with the title and an
 * optional action, and
 * a body that scrolls inside the tile's grid size.
 */
export const DashboardWidgetCard = ({
  action,
  children,
  title,
}: Readonly<{
  action?: ReactNode;
  children: ReactNode;
  title: string;
}>) => (
  <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-background shadow-xs">
    <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b px-4">
      <h2 className="truncate text-sm font-semibold">{title}</h2>
      {action}
    </header>
    <div className="styled-scroll min-h-0 flex-1 overflow-y-auto p-2">{children}</div>
  </section>
);

export const DashboardWidgetEmptyState = ({ children }: Readonly<{ children: string }>) => (
  <Empty size="sm">
    <Empty.Description>{children}</Empty.Description>
  </Empty>
);

export const DashboardWidgetListSkeleton = () => (
  <div className="flex flex-col gap-2 p-2">
    {[0, 1, 2].map((index) => (
      <Skeleton key={index} className="h-6 w-full" />
    ))}
  </div>
);
