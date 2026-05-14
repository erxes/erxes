import { IconChevronLeft } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

export const AutomationSettingsDetailHeader = ({
  title,
  description,
  backTo,
  actions,
}: {
  title: string;
  description: string;
  backTo: string;
  actions?: ReactNode;
}) => {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 border-b bg-background px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8 shrink-0" asChild>
          <Link to={backTo}>
            <IconChevronLeft className="size-4" />
          </Link>
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold leading-tight">
            {title}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
};
