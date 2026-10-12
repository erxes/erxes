import type { ComponentProps } from '@blocknote/react';

export type ToolbarFormattingButtonProps =
  ComponentProps['FormattingToolbar']['Button'] & {
    'data-test'?: string;
    disabled?: boolean;
  };
