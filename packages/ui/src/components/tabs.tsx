import React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'erxes-ui/lib/utils';

const tabsListVariants = cva('h-auto text-accent-foreground', {
  variants: {
    variant: {
      underline: 'gap-2 rounded-none border-b border-border bg-transparent px-0 py-1',
      segment: 'w-fit gap-1 rounded-lg bg-muted p-1',
    },
  },
  defaultVariants: {
    variant: 'underline',
  },
});

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-disabled:pointer-events-none data-disabled:opacity-50',
  {
    variants: {
      variant: {
        underline:
          'relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent data-active:bg-transparent data-active:shadow-none data-active:after:bg-primary data-active:hover:bg-accent data-active:text-primary-text',
        segment:
          'gap-2 rounded-md text-muted-foreground hover:bg-accent data-active:bg-background data-active:text-foreground data-active:shadow-sm data-active:hover:bg-background',
      },
    },
    defaultVariants: {
      variant: 'underline',
    },
  },
);

/**
 * A tab in a strip that isn't a Tabs list: links, menu triggers or draggable tabs, which own
 * their own semantics. `pill` fills the open tab; `raised` lifts it onto the background, as the
 * app tabs in the top bar do.
 */
export const tabButtonVariants = cva(
  'flex h-7 shrink-0 items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        pill: 'px-2 transition-colors outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-accent/60 [&_svg]:size-4',
        raised:
          'cursor-default select-none border border-transparent pl-2.5 pr-1 font-medium transition-[background-color,border-color,box-shadow,color,opacity] hover:bg-accent/70',
      },
      active: { true: 'text-foreground' },
      /** Lifted while it is dragged to a new place. */
      dragging: { true: 'z-10 opacity-60' },
    },
    compoundVariants: [
      { variant: 'pill', active: true, className: 'bg-accent font-medium hover:bg-accent' },
      { variant: 'raised', active: true, className: 'border-border bg-background shadow-xs' },
    ],
    defaultVariants: { variant: 'pill' },
  },
);

type TTabsVariant = VariantProps<typeof tabsListVariants>['variant'];

const TabsVariantContext = React.createContext<TTabsVariant>('underline');

/** Typed over the tab values, so a change handler gets the caller's value type back. */
const TabsRoot = <Value extends string>(
  props: Omit<TabsPrimitive.Root.Props, 'value' | 'defaultValue' | 'onValueChange'> & {
    value?: Value;
    defaultValue?: Value;
    onValueChange?: (value: Value, eventDetails: TabsPrimitive.Root.ChangeEventDetails) => void;
  },
) => <TabsPrimitive.Root {...props} />;

/** Arrow keys select the tab they land on, as under Radix. */
const TabsList = ({
  className,
  variant,
  activateOnFocus = true,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) => (
  <TabsVariantContext value={variant ?? 'underline'}>
    <TabsPrimitive.List
      activateOnFocus={activateOnFocus}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  </TabsVariantContext>
);

const TabsTrigger = ({
  className,
  variant,
  ...props
}: TabsPrimitive.Tab.Props & VariantProps<typeof tabsTriggerVariants>) => {
  const listVariant = React.use(TabsVariantContext);

  return (
    <TabsPrimitive.Tab
      className={cn(tabsTriggerVariants({ variant: variant ?? listVariant }), className)}
      {...props}
    />
  );
};

/** An inactive panel carries data-hidden; one kept mounted also gets the hidden attribute. */
const TabsContent = ({ className, ...props }: TabsPrimitive.Panel.Props) => (
  <TabsPrimitive.Panel className={cn('focus-visible:outline-hidden', className)} {...props} />
);

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});
