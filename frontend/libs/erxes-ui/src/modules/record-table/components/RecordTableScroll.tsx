import { ScrollArea } from 'erxes-ui/components';

import { forwardRef } from 'react';
import { cn } from 'erxes-ui/lib/utils';

export const RecordTableScroll = forwardRef<
  React.ElementRef<typeof ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollArea>
>(({ children, className, ...props }, ref) => {
  return (
    <ScrollArea
      ref={ref}
      scrollBarClassName="z-10"
      className={cn('h-full w-full pb-3 pr-3', className)}
      {...props}
    >
      {children}
      <ScrollArea.Bar orientation="horizontal" className="z-10" />
    </ScrollArea>
  );
});

RecordTableScroll.displayName = 'RecordTableScroll';
