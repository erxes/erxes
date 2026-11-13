import * as React from 'react';

import { cn } from 'erxes-ui/lib/utils';

const CardRoot = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div
    ref={ref}
    className={cn('rounded-xl bg-card text-card-foreground shadow-sm', className)}
    {...props}
  />
);

const CardHeader = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('flex flex-col text-xl space-y-1.5 p-6', className)} {...props} />
);

const CardTitle = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight text-xl', className)}
    {...props}
  />
);

const CardDescription = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground font-medium', className)}
    {...props}
  />
);

const CardContent = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);

const CardFooter = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
});
