import React from 'react';

import { IconDots } from '@tabler/icons-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

import type { ButtonProps } from 'erxes-ui/components/button';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';

const moreButtonVariants = cva('h-8 w-full', {
  variants: {
    /** A ground that marks the button: `highlight` while an option it opens is turned on. */
    tint: {
      none: '',
      highlight: 'bg-tint-highlight hover:bg-tint-highlight-strong',
    },
  },
  defaultVariants: { tint: 'none' },
});

/**
 * A row's icon button filling its cell, three dots unless given children. `tint="highlight"`
 * marks it while what it opens is on (3.x's yellow split mark on an inventory line).
 */
export const RecordTableMoreButton = ({
  ref,
  className,
  children,
  tint,
  ...props
}: ButtonProps &
  VariantProps<typeof moreButtonVariants> &
  React.RefAttributes<HTMLButtonElement>) => {
  const { t } = useTranslation('ui', { keyPrefix: 'table' });

  return (
    <Button
      ref={ref}
      aria-label={children ? undefined : t('more', 'More')}
      variant="cell"
      size="icon"
      data-tint={tint && tint !== 'none' ? tint : undefined}
      className={cn(moreButtonVariants({ tint }), className)}
      {...props}
    >
      {children || <IconDots className="text-muted-foreground" />}
    </Button>
  );
};
