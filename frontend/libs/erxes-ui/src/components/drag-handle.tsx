import { IconGripVertical } from '@tabler/icons-react';
import * as React from 'react';

import { Button, ButtonProps } from './button';
import { cn } from 'erxes-ui/lib';

export type DragHandleProps = Omit<ButtonProps, 'children' | 'size'>;

export const DragHandle = React.forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ className, variant = 'ghost', ...props }, ref) => (
    <Button
      className={cn(
        'size-5 flex-none cursor-grab px-0 text-accent-foreground active:cursor-grabbing',
        className,
      )}
      ref={ref}
      size="icon"
      variant={variant}
      {...props}
    >
      <IconGripVertical className="size-4" stroke={1.5} />
    </Button>
  ),
);

DragHandle.displayName = 'DragHandle';
