import React from 'react';

import { IconDots } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Separator } from './separator';
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

const BreadcrumbLink = ({ className, children, ...props }: React.ComponentProps<'a'>) => (
  <a
    className={cn('text-muted-foreground transition-colors hover:text-foreground', className)}
    {...props}
  >
    {children}
  </a>
);

const breadcrumbPageVariants = cva('font-medium text-foreground', {
  variants: {
    variant: {
      // Wraps a link that brings its own look.
      default: '',
      // Plain text, padded to line up with the ghost-button crumbs beside it.
      text: 'truncate px-3 py-1 leading-5',
    },
  },
  defaultVariants: { variant: 'default' },
});

const BreadcrumbPage = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof breadcrumbPageVariants>) => (
  <span
    ref={ref}
    aria-current="page"
    className={cn(breadcrumbPageVariants({ variant }), className)}
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
