import type { ComponentProps } from '@blocknote/react';
import { components } from '@blocknote/shadcn';
import { cn } from 'erxes-ui/lib/utils';

export const ToolbarMenuItem = ({
  className,
  ...props
}: ComponentProps['Generic']['Menu']['Item']) => (
  <components.Generic.Menu.Item
    {...props}
    className={cn(
      'pl-2! [&>.bn-absolute]:hidden!',
      'hover:bg-(--color-primary)/15! hover:text-primary-text!',
      'focus:bg-(--color-primary)/15! focus:text-primary-text!',
      'data-checked:bg-(--color-primary)/10! data-checked:text-primary-text!',
      className,
    )}
  />
);
