import { ComponentProps } from 'react';
import { cn, RecordTable } from 'erxes-ui';
import { IField } from 'ui-modules';

export const PropertiesRow = ({
  onRowClick,
  className,
  original,
  ...props
}: ComponentProps<typeof RecordTable.Row> & {
  onRowClick: (field: IField) => void;
}) => (
  <RecordTable.Row
    {...props}
    original={original}
    className={cn('cursor-pointer', className)}
    onClick={() => original && onRowClick(original as IField)}
  />
);
