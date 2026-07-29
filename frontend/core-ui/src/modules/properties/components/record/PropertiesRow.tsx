import { ComponentProps } from 'react';
import { useAtomValue } from 'jotai';
import { cn, RecordTable } from 'erxes-ui';
import { IField } from 'ui-modules';
import { selectedFieldIdsState } from '../../states/selectedFieldsState';

export const PropertiesRow = ({
  onRowClick,
  className,
  original,
  ...props
}: ComponentProps<typeof RecordTable.Row> & {
  onRowClick: (field: IField) => void;
}) => {
  const selectedFieldIds = useAtomValue(selectedFieldIdsState);
  const isSelected = !!(
    original && selectedFieldIds[(original as IField)._id]
  );

  return (
    <RecordTable.Row
      {...props}
      original={original}
      data-state={isSelected ? 'selected' : undefined}
      className={cn('cursor-pointer', className)}
      onClick={() => original && onRowClick(original as IField)}
    />
  );
};
