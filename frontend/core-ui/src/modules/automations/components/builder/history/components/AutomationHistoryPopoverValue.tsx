import { Button, Popover, ScrollArea, cn } from 'erxes-ui';
import { ReactNode } from 'react';

type AutomationHistoryPopoverValueProps = {
  preview: ReactNode;
  content?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export const stringifyAutomationHistoryValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value == null) {
    return '';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (_error) {
    return String(value);
  }
};

export const AutomationHistoryPopoverValue = ({
  preview,
  content,
  className,
  contentClassName,
}: AutomationHistoryPopoverValueProps) => {
  const resolvedContent = content ?? preview;
  const isPrimitiveContent =
    typeof resolvedContent === 'string' || typeof resolvedContent === 'number';

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-8 w-full justify-start overflow-hidden rounded-none px-2 text-left font-normal',
            className,
          )}
        >
          <span className="block w-full truncate">{preview}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        sideOffset={8}
        className={cn(
          'w-fit min-w-80 max-w-[min(44rem,calc(100vw-theme(spacing.8)))] p-0 shadow-lg',
          contentClassName,
        )}
      >
        <ScrollArea className="max-h-[28rem]">
          <div className="p-4">
            {isPrimitiveContent ? (
              <div className="select-text whitespace-pre-wrap break-all text-sm leading-6 text-foreground">
                {resolvedContent}
              </div>
            ) : (
              <div className="min-w-0">{resolvedContent}</div>
            )}
          </div>
        </ScrollArea>
      </Popover.Content>
    </Popover>
  );
};
