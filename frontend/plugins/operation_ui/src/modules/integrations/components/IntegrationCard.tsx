import { Card, Skeleton } from 'erxes-ui';
import { Link } from 'react-router-dom';
import type { ComponentType } from 'react';
import { IntegrationLogo } from './IntegrationLogo';

const IntegrationCount = ({
  count,
  loading,
  failed,
}: Readonly<{ count: number; loading: boolean; failed: boolean }>) => {
  if (loading) {
    return <Skeleton className="h-4 w-3" />;
  }

  if (failed) {
    return <span className="text-destructive">unavailable</span>;
  }

  return <span>({count})</span>;
};

export const IntegrationCard = ({
  to,
  icon,
  name,
  description,
  count,
  loading,
  failed,
}: Readonly<{
  to: string;
  icon: ComponentType<{ className?: string }>;
  name: string;
  description: string;
  count: number;
  loading: boolean;
  failed: boolean;
}>) => (
  <Link
    to={to}
    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Card className="flex h-full flex-col gap-2 rounded-lg p-3 transition-colors hover:bg-accent/40">
      <div className="flex gap-2">
        <IntegrationLogo icon={icon} />
        <h2 className="self-center text-sm font-semibold">{name}</h2>
        <div className="ml-auto flex font-mono text-xs text-muted-foreground">
          <IntegrationCount count={count} loading={loading} failed={failed} />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{description}</p>
    </Card>
  </Link>
);
