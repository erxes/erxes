import { IconInfoCircle } from '@tabler/icons-react';
import { cn } from 'erxes-ui/lib';
import { Button } from './button';
import { Tooltip } from './tooltip';
import React from 'react';

const InfoCardRoot = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col bg-foreground/5 rounded-xl p-1 pt-0',
        className,
      )}
    >
      <div className="flex items-center justify-between h-7 pl-2 pr-1">
        <h3 className="font-medium text-xs font-mono uppercase">{title}</h3>
        {!!description && (
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-accent-foreground"
                >
                  <IconInfoCircle className="size-4" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{description}</Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        )}
      </div>
      {children}
    </div>
  );
};

const InfoCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-3 bg-background rounded-lg p-3 shadow-sm flex-auto',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
InfoCardContent.displayName = 'InfoCardContent';

export const InfoCard = Object.assign(InfoCardRoot, {
  Content: InfoCardContent,
});
