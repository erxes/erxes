import * as React from 'react';
import { Separator } from 'erxes-ui';

export type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className,
}) => <Separator orientation={orientation} className={className} />;
