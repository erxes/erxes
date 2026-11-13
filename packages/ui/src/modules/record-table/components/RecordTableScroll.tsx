import { ScrollArea } from 'erxes-ui/components/scroll-area';

import { cn } from 'erxes-ui/lib/utils';

export const RecordTableScroll = ({
  ref,
  children,
  className,
  ...props
}: React.ComponentProps<typeof ScrollArea>) => {
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
};
