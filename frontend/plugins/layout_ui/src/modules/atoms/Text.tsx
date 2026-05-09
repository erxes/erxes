import * as React from 'react';
import { cn } from 'erxes-ui';

export type TextVariant = 'body' | 'muted' | 'small' | 'lead';

const variantMap: Record<TextVariant, string> = {
  body: 'text-sm text-foreground',
  muted: 'text-sm text-muted-foreground',
  small: 'text-xs text-muted-foreground',
  lead: 'text-lg text-foreground',
};

export type TextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  variant?: TextVariant;
  as?: 'p' | 'span' | 'div';
};

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'body', as: Tag = 'p', ...props }, ref) => (
    <Tag
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={cn(variantMap[variant], className)}
      {...props}
    />
  ),
);
Text.displayName = 'Text';
