import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { IconChevronDown } from '@tabler/icons-react';

import { cn } from '../lib/utils';

const AccordionItem = ({ className, ...props }: AccordionPrimitive.Item.Props) => (
  <AccordionPrimitive.Item className={cn('border-b border-border', className)} {...props} />
);

const AccordionTrigger = ({ className, children, ...props }: AccordionPrimitive.Trigger.Props) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-left font-semibold transition-all hover:underline [&[data-panel-open]>svg]:rotate-180',
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

const AccordionPanel = ({ className, children, ...props }: AccordionPrimitive.Panel.Props) => (
  <AccordionPrimitive.Panel
    className="overflow-y-clip text-sm transition-all data-closed:animate-accordion-up data-open:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Panel>
);

export const Accordion = Object.assign(AccordionPrimitive.Root, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
});
