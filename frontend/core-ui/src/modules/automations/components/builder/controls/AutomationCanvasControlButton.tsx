import { Button, Tooltip, cn } from 'erxes-ui';
import type React from 'react';

export const CANVAS_CONTROL_BUTTON_CLASS =
  'size-7 rounded text-muted-foreground hover:bg-accent hover:text-foreground [&>svg]:size-4';
export const CANVAS_ACTIVE_CONTROL_BUTTON_CLASS =
  'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary';

export const AutomationCanvasControlButton = ({
  active = false,
  children,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) => {
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onClick}
          className={cn(
            CANVAS_CONTROL_BUTTON_CLASS,
            active && CANVAS_ACTIVE_CONTROL_BUTTON_CLASS,
          )}
        >
          {children}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  );
};
