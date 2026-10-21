import type { ComponentProps } from '@blocknote/react';
import { components } from '@blocknote/shadcn';
import { cn } from 'erxes-ui/lib';

export const ToolbarMenuDropdown = ({
  className,
  ...props
}: ComponentProps['Generic']['Menu']['Dropdown']) => (
  <components.Generic.Menu.Dropdown
    {...props}
    className={cn(
      'max-h-[min(20rem,50dvh)]! overflow-y-auto! overscroll-contain',
      className,
    )}
  />
);
