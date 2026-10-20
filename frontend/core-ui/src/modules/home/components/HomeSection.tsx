import { Skeleton } from 'erxes-ui';
import type { ReactNode } from 'react';

export const HomeSection = ({
  action,
  children,
  title,
}: Readonly<{
  action?: ReactNode;
  children: ReactNode;
  title: string;
}>) => (
  <section className="flex min-w-0 flex-col rounded-xl border bg-background shadow-xs">
    <header className="flex h-11 shrink-0 items-center justify-between border-b px-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {action}
    </header>
    <div className="min-h-0 flex-1 p-2">{children}</div>
  </section>
);

export const HomeEmptyState = ({
  children,
}: Readonly<{ children: string }>) => (
  <p className="px-2 py-6 text-center text-sm text-muted-foreground">
    {children}
  </p>
);

export const HomeListSkeleton = () => (
  <div className="flex flex-col gap-2 p-2">
    {[0, 1, 2].map((index) => (
      <Skeleton key={index} className="h-6 w-full" />
    ))}
  </div>
);
