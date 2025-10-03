import React from 'react';

import { Table } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib/utils';
export const RecordTableRoot = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  return (
    <Table
      ref={ref}
      className={cn('w-[--table-width] leading-[0]', className)}
      {...props}
    />
  );
});
