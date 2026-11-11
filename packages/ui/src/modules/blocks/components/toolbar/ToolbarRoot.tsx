import type { ComponentProps } from '@blocknote/react';
import { components } from '@blocknote/shadcn';
import { cn } from 'erxes-ui/lib';

export const ToolbarRoot = ({
  className,
  ...props
}: ComponentProps['FormattingToolbar']['Root']) => (
  <components.FormattingToolbar.Root
    {...props}
    className={cn('min-w-0 max-w-full flex-wrap!', className)}
  />
);
