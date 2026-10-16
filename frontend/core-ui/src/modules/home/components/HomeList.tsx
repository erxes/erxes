import { timeAgo } from '@/home/utils/timeAgo';
import { AppLogo } from '@/navigation/components/AppLogo';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconFile } from '@tabler/icons-react';
import { ScrollArea } from 'erxes-ui';
import { ElementType, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const HomePage = ({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) => (
  <ScrollArea className="h-full" viewportClassName="[&>div]:block!">
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="px-1">
        <h1 className="text-xl font-semibold tracking-[-0.01em]">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  </ScrollArea>
);

export const HomeSection = ({
  label,
  count,
  action,
  children,
}: {
  label: string;
  count?: number;
  action?: { label: string; to: string };
  children: ReactNode;
}) => (
  <section className="flex min-w-0 flex-col gap-2">
    <div className="flex items-center gap-2 px-1">
      <h2 className="flex flex-1 items-center gap-2 font-mono text-xs font-medium text-muted-foreground uppercase">
        {label}
        {!!count && (
          <span className="tabular-nums text-foreground/60">{count}</span>
        )}
      </h2>
      {action && (
        <Link
          to={action.to}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {action.label}
        </Link>
      )}
    </div>
    {children}
  </section>
);

export const HomeList = ({ children }: { children: ReactNode }) => (
  <ul className="divide-y overflow-hidden rounded-lg border">{children}</ul>
);

export const HomeListItem = ({
  to,
  leading,
  title,
  subtitle,
  trailing,
}: {
  to: string;
  leading: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}) => (
  <li>
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/60"
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {subtitle && (
          <span className="block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
      {trailing}
    </Link>
  </li>
);

export const HomeEmpty = ({ children }: { children: ReactNode }) => (
  <p className="rounded-lg border p-4 text-sm text-muted-foreground">
    {children}
  </p>
);

/** The owning app's logo, or a quiet icon tile for pages outside any app. */
export const HomeItemMark = ({
  app,
  icon: Icon = IconFile,
}: {
  app?: INavigationActivity;
  icon?: ElementType;
}) =>
  app ? (
    <AppLogo activity={app} size={24} />
  ) : (
    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
      <Icon className="size-3.5" />
    </span>
  );

export const HomeItemTime = ({ date }: { date: string | number }) => (
  <span className="font-mono text-xs text-muted-foreground tabular-nums">
    {timeAgo(date)}
  </span>
);
