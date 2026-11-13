import React from 'react';

import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';

export const RecordTableRoot = ({
  ref,
  className,
  style,
  ...props
}: React.ComponentProps<'table'>) => {
  return (
    <Table
      ref={ref}
      className={cn('leading-0', className)}
      style={{ width: 'var(--table-width)', ...style }}
      {...props}
    />
  );
};
