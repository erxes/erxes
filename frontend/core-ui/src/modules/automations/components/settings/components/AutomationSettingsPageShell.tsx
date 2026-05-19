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
    <ScrollArea className="h-full w-full">
      <div className="flex min-h-full w-full flex-col gap-6 px-10 py-6">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
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
