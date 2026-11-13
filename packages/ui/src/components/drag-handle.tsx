import { IconGripVertical } from '@tabler/icons-react';

import type { ButtonProps } from './button';
import { Button } from './button';
import { cn } from 'erxes-ui/lib/utils';

type DragHandleProps = Omit<ButtonProps, 'asChild' | 'children' | 'size'>;

export const DragHandle = ({
  ref,
  className,
  variant = 'ghost',
  ...props
}: DragHandleProps & React.RefAttributes<HTMLButtonElement>) => (
  <Button
    className={cn(
      'size-5 flex-none cursor-grab px-0 text-accent-foreground active:cursor-grabbing',
      className,
    )}
    ref={ref}
    size="icon"
    variant={variant}
    {...props}
    asChild={false}
  >
    <IconGripVertical className="size-4" stroke={1.5} />
  </Button>
);
