import * as React from 'react';
import { cn } from 'erxes-ui';
import { Text } from '../atoms/Text';

export type KeyValueRowProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

export const KeyValueRow: React.FC<KeyValueRowProps> = ({
  label,
  value,
  className,
}) => (
  <div className={cn('grid grid-cols-2 gap-2 py-1', className)}>
    <Text variant="muted">{label}</Text>
    <div className="text-sm text-foreground text-right">{value}</div>
  </div>
);
