import { ScrollArea } from 'erxes-ui';
import type { ReactNode } from 'react';

export const AutomationSettingsPageShell = ({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <ScrollArea
      className="h-full min-w-0 w-full"
      viewportClassName="min-w-0 overflow-x-hidden [&>div]:block! [&>div]:min-w-0"
    >
      <div className="flex min-h-full min-w-0 max-w-full flex-col gap-6 px-6 py-6 xl:px-10">
        <div className="flex min-w-0 items-start justify-between gap-6">
          <div className="min-w-0 space-y-1">
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && (
              <p className="max-w-3xl text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
        {children}
      </div>
    </ScrollArea>
  );
};
