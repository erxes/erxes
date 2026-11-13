import * as React from 'react';

import { Accordion as AccordionPrimitive } from 'radix-ui';
import { IconChevronDown } from '@tabler/icons-react';

import { cn } from '../lib/utils';

const AccordionRoot = AccordionPrimitive.Root;

const AccordionItem = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-border', className)}
    {...props}
  />
);

const AccordionTrigger = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-left font-semibold transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <IconChevronDown
        className="shrink-0 opacity-60 transition-transform duration-200 size-4"
        aria-hidden="true"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const AccordionContent = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-y-clip text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
);

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
