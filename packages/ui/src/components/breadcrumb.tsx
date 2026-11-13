import * as React from 'react';

import { IconDots } from '@tabler/icons-react';
import { Separator } from './separator';
import { Slot } from 'radix-ui';
import { cn } from '../lib/utils';

const BreadcrumbRoot = ({
  ref,
  ...props
}: React.ComponentProps<'nav'> & {
  separator?: React.ReactNode;
}) => <nav ref={ref} aria-label="breadcrumb" {...props} />;

const BreadcrumbList = ({ ref, className, ...props }: React.ComponentProps<'ol'>) => (
  <ol
    ref={ref}
    className={cn('flex flex-wrap items-center wrap-break-word text-sm gap-1', className)}
    {...props}
  />
);

const BreadcrumbItem = ({ ref, className, ...props }: React.ComponentProps<'li'>) => (
  <li ref={ref} className={cn('inline-flex items-center gap-1.5', className)} {...props} />
);

const BreadcrumbLink = ({
  ref,
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot.Root : 'a';

  return (
    <Comp
      ref={ref}
      className={cn('text-muted-foreground transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
};

const BreadcrumbPage = ({ ref, className, ...props }: React.ComponentProps<'span'>) => (
  <span
    ref={ref}
    aria-current="page"
    className={cn('font-medium text-foreground', className)}
    {...props}
  />
);

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<'li'>) => (
  <li role="presentation" aria-hidden="true" className={cn('h-3', className)} {...props}>
    {children ?? <Separator.Inline />}
  </li>
);

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <IconDots className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
});
