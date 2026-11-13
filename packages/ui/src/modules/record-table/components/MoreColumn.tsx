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
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-full focus-visible:outline-transparent rounded-none focus-visible:shadow-subtle',
        className,
      )}
      {...props}
    >
      {children || <IconDots className="text-muted-foreground" />}
    </Button>
  );
};
