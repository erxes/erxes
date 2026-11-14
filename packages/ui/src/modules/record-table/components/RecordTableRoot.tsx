import React from 'react';

import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';

/** The table, as wide as the `--table-width` its container sets. */
export const RecordTableRoot = ({ ref, className, ...props }: React.ComponentProps<'table'>) => (
  <Table ref={ref} className={cn('leading-0 w-(--table-width)', className)} {...props} />
);
