import React, { createContext, use, useCallback, useLayoutEffect, useState } from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'erxes-ui/lib/utils';
import { IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

// Base UI shows the selected item's label from the root's `items`, and its items mount only
// while the popup is open. So Content also renders its children once out of sight, where each
// Item hands its children to the root as its label and renders nothing.
const RegisterLabelContext = createContext<(value: string, label: React.ReactNode) => void>(
  () => undefined,
);

const CollectingContext = createContext(false);

/** An empty string means nothing is selected, as it did under Radix. Clearing isn't reported. */
const SelectRoot = <Value extends string>({
  value,
  defaultValue,
  onValueChange,
  ...props
}: Omit<SelectPrimitive.Root.Props<Value>, 'value' | 'defaultValue' | 'onValueChange' | 'items'> & {
  value?: Value | '';
  defaultValue?: Value | '';
  onValueChange?: (value: Value) => void;
}) => {
  const [labels, setLabels] = useState<Record<string, React.ReactNode>>({});

  const register = useCallback((itemValue: string, label: React.ReactNode) => {
    setLabels((prev) => (prev[itemValue] === label ? prev : { ...prev, [itemValue]: label }));
  }, []);

  return (
    <RegisterLabelContext value={register}>
      <SelectPrimitive.Root
        items={labels}
        value={value === '' ? null : value}
        defaultValue={defaultValue === '' ? null : defaultValue}
        onValueChange={(next) => {
          if (next !== null) onValueChange?.(next);
        }}
        {...props}
      />
    </RegisterLabelContext>
  );
};

const SelectGroup = (props: SelectPrimitive.Group.Props) =>
  use(CollectingContext) ? props.children : <SelectPrimitive.Group {...props} />;

const selectTriggerVariants = cva(
  'flex h-7 w-full items-center font-medium justify-between whitespace-nowrap rounded bg-transparent px-3 py-1 transition text-sm shadow-xs data-placeholder:text-accent-foreground focus:outline-hidden focus:shadow-focus data-disabled:cursor-not-allowed data-disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: '',
        // A 1px border instead of the drop shadow, for dense forms.
        bordered: 'border border-input font-normal shadow-none',
        // No border or corners: a cell in a grid that draws its own lines.
        flush: 'rounded-none shadow-none',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const SelectTrigger = ({
  className,
  children,
  variant,
  ...props
}: SelectPrimitive.Trigger.Props & VariantProps<typeof selectTriggerVariants>) => (
  <SelectPrimitive.Trigger className={cn(selectTriggerVariants({ variant }), className)} {...props}>
    {children}
    <IconChevronDown aria-hidden className="w-4 h-4 opacity-50" />
  </SelectPrimitive.Trigger>
);

const SelectContent = ({
  className,
  children,
  side = 'bottom',
  align = 'center',
  ...props
}: SelectPrimitive.Popup.Props & Pick<SelectPrimitive.Positioner.Props, 'side' | 'align'>) => (
  <>
    <CollectingContext value>{children}</CollectingContext>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="isolate z-50"
        side={side}
        align={align}
        alignItemWithTrigger={false}
        collisionPadding={0}
      >
        <SelectPrimitive.Popup
          className={cn(
            'relative max-h-popup min-w-32 overflow-hidden flex flex-col rounded-md bg-background shadow-lg data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className,
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow className="flex cursor-default items-center justify-center py-1">
            <IconChevronUp className="w-4 h-4" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List className="max-h-inherit w-full min-w-(--anchor-width) overflow-y-auto p-1">
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className="flex cursor-default items-center justify-center py-1">
            <IconChevronDown className="w-4 h-4" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  </>
);

const SelectLabel = ({ className, ...props }: SelectPrimitive.GroupLabel.Props) =>
  use(CollectingContext) ? null : (
    <SelectPrimitive.GroupLabel
      className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}
      {...props}
    />
  );

const CollectedItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const register = use(RegisterLabelContext);

  useLayoutEffect(() => register(value, children), [register, value, children]);

  return null;
};

const SelectItem = ({
  className,
  children,
  value,
  ...props
}: Omit<SelectPrimitive.Item.Props, 'value'> & { value: string }) =>
  use(CollectingContext) ? (
    <CollectedItem value={value}>{children}</CollectedItem>
  ) : (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <IconCheck className="w-4 h-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );

const SelectSeparator = ({ className, ...props }: SelectPrimitive.Separator.Props) =>
  use(CollectingContext) ? null : (
    <SelectPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  );

export const Select = Object.assign(SelectRoot, {
  Group: SelectGroup,
  Value: SelectPrimitive.Value,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Label: SelectLabel,
  Item: SelectItem,
  Separator: SelectSeparator,
});
