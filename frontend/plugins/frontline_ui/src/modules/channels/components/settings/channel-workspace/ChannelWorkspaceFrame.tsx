import { ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { ReactNode, Suspense } from 'react';

export const ChannelWorkspaceSkeleton = () => (
  <div className="flex flex-1 min-h-0">
    <div className="flex w-64 shrink-0 flex-col gap-3 border-r p-3">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>
    <Spinner containerClassName="flex-1" />
  </div>
);

export const ChannelWorkspaceFrame = ({
  nav,
  children,
}: {
  nav: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex flex-1 min-h-0 overflow-hidden">
    {nav}
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={<Spinner containerClassName="flex-1" />}>
        {children}
      </Suspense>
    </div>
  </div>
);

export const WorkspaceRail = ({
  header,
  footer,
  children,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) => (
  <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar/40">
    {header}
    <ScrollArea className="min-h-0 flex-1">{children}</ScrollArea>
    {footer}
  </aside>
);
