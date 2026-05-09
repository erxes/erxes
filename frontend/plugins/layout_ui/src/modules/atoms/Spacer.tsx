import * as React from 'react';
import { cn } from 'erxes-ui';

export type SpacerProps = {
  axis?: 'horizontal' | 'vertical';
  className?: string;
};

export const Spacer: React.FC<SpacerProps> = ({
  axis = 'horizontal',
  className,
}) => (
  <div
    aria-hidden
    className={cn(axis === 'horizontal' ? 'flex-1' : 'h-full flex-1', className)}
  />
);
