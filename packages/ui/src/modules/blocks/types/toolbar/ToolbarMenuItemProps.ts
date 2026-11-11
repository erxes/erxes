import type { ComponentProps } from '@blocknote/react';

export type ToolbarMenuItemProps = ComponentProps['Generic']['Menu']['Item'] & {
  disabled?: boolean;
};
