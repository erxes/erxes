import React from 'react';

import { IconDots } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { ButtonProps } from 'erxes-ui/components/button';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';

export const RecordTableMoreButton = ({
  ref,
  className,
  children,
  ...props
}: ButtonProps & React.RefAttributes<HTMLButtonElement>) => {
  const { t } = useTranslation('ui', { keyPrefix: 'table' });

  return (
    <Button
      ref={ref}
      aria-label={children ? undefined : t('more', 'More')}
      variant="cell"
      size="icon"
      className={cn('h-8 w-full', className)}
      {...props}
    >
      {children || <IconDots className="text-muted-foreground" />}
    </Button>
  );
};
