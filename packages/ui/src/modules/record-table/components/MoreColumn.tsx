import React from 'react';

import { IconDots } from '@tabler/icons-react';

import type { ButtonProps } from 'erxes-ui/components/button';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';

export const RecordTableMoreButton = ({
  ref,
  className,
  children,
  ...props
}: ButtonProps & React.RefAttributes<HTMLButtonElement>) => {
  return (
    <Button
      ref={ref}
      aria-label={children ? undefined : 'More'}
      variant="cell"
      size="icon"
      className={cn('h-8 w-full', className)}
      {...props}
    >
      {children || <IconDots className="text-muted-foreground" />}
    </Button>
  );
};
