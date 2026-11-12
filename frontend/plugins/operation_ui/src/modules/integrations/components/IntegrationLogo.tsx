import { cn } from 'erxes-ui';
import type { ComponentType } from 'react';

export const IntegrationLogo = ({
  icon: Icon,
  className,
}: Readonly<{
  icon: ComponentType<{ className?: string }>;
  className?: string;
}>) => (
  <div
    className={cn(
      'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded bg-background p-1 shadow-sm',
      className,
    )}
  >
    <Icon className="size-full" />
  </div>
);
