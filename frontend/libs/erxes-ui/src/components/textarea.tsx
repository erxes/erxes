import * as React from 'react';

import { cn } from 'erxes-ui/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-accent-foreground focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
