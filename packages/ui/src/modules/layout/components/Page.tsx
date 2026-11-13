import React from 'react';
import { cn } from 'erxes-ui/lib/utils';

export const PageContainer = ({
  ref,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>) => {
  return (
    <div ref={ref} className={cn('flex flex-col h-full overflow-hidden', className)} {...props}>
      {children || 'Page'}
    </div>
  );
};

export const PageSubHeader = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      ref={ref}
      className={cn('flex-none bg-background px-3 py-1 border-b flex gap-3 h-auto', className)}
      {...props}
    />
  );
};
