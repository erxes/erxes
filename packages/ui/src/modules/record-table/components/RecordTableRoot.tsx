import React from 'react';

import { Table } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib/utils';
export const RecordTableRoot = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, style, ...props }, ref) => {
  return (
    <Table
      ref={ref}
      className={cn('leading-0', className)}
      style={{ width: 'var(--table-width)', ...style }}
      {...props}
    />
  );
});
