import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { ComponentType, ReactNode } from 'react';

export const IntegrationCard = ({
  to,
  icon: Icon,
  name,
  description,
  status,
}: {
  to: string;
  icon: ComponentType<{ className?: string }>;
  name: string;
  description: string;
  status: ReactNode;
}) => (
  <Link
    to={to}
    className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-sidebar/50"
  >
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
      <Icon className="size-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-semibold">{name}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {status}
      <IconChevronRight className="size-4 text-muted-foreground" />
    </div>
  </Link>
);
