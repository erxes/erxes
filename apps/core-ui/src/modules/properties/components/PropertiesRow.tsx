import type { Field } from '@erxes/core-contract';
import { cn, RecordTable } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import type { ComponentProps } from 'react';
import { selectedFieldIdsState } from '../states';

export const PropertiesRow = ({
  onRowClick,
  className,
  original,
  ...props
}: ComponentProps<typeof RecordTable.Row> & { onRowClick: (field: Field) => void }) => {
  const selectedFieldIds = useAtomValue(selectedFieldIdsState);
  const field = original as Field | undefined;
  const isSelected = !!(field && selectedFieldIds[field.id]);

  return (
    <RecordTable.Row
      {...props}
      original={original}
      data-state={isSelected ? 'selected' : undefined}
      className={cn('cursor-pointer', className)}
      onClick={() => field && onRowClick(field)}
    />
  );
};
