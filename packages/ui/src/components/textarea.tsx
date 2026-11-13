import * as React from 'react';

import { cn } from 'erxes-ui/lib/utils';

export const Textarea = ({ ref, className, ...props }: React.ComponentProps<'textarea'>) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded bg-transparent px-3 py-1.5 text-sm shadow-xs transition-[color,box-shadow] placeholder:text-accent-foreground focus-visible:outline-hidden focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
