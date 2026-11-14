import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { Input } from './input';
import { Textarea } from './textarea';
import { cn } from 'erxes-ui/lib/utils';

/**
 * An input or textarea with an icon or button beside its text, inside the same box. The group
 * draws the box and the focus ring; the field inside is bare. After shadcn's InputGroup.
 */
const InputGroupRoot = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    role="group"
    className={cn(
      'group/input-group relative flex h-7 w-full min-w-0 items-center rounded-sm bg-background shadow-xs transition-[color,box-shadow] has-[>textarea]:h-auto has-[>:is(input,textarea):focus-visible]:shadow-focus has-[>:is(input,textarea):disabled]:opacity-50',
      // The addon takes the field's padding on its side.
      'has-[>[data-align=start]]:[&>:is(input,textarea)]:pl-1.5 has-[>[data-align=end]]:[&>:is(input,textarea)]:pr-1.5',
      className,
    )}
    {...props}
  />
);

const addonVariants = cva(
  'flex h-full shrink-0 items-center text-muted-foreground group-has-[>textarea]/input-group:h-auto group-has-[>textarea]/input-group:self-start group-has-[>textarea]/input-group:pt-1.5',
  {
    variants: {
      align: {
        start: 'order-first pl-2.5',
        end: 'order-last pr-1.5',
      },
    },
    defaultVariants: { align: 'start' },
  },
);

/** An icon or a button before (`start`) or after (`end`) the text. */
const InputGroupAddon = ({
  className,
  align,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof addonVariants>) => (
  <div
    data-align={align ?? 'start'}
    className={cn(addonVariants({ align }), className)}
    {...props}
  />
);

const InputGroupInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
  <Input
    className={cn(
      'h-full min-w-0 flex-1 rounded-none bg-transparent shadow-none focus-visible:shadow-none',
      className,
    )}
    {...props}
  />
);

const InputGroupTextarea = ({ className, ...props }: React.ComponentProps<typeof Textarea>) => (
  <Textarea
    className={cn('min-w-0 flex-1 shadow-none focus-visible:shadow-none', className)}
    {...props}
  />
);

export const InputGroup = Object.assign(InputGroupRoot, {
  Addon: InputGroupAddon,
  Input: InputGroupInput,
  Textarea: InputGroupTextarea,
});
