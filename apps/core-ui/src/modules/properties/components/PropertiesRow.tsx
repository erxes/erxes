import { Field } from '@erxes/core-contract';
import { cn, RecordTable } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import type { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectedFieldIdsState } from '../states';
import { propertyEditPath } from './propertiesColumns';

// erxes-ui hands rows over untyped; these are the parts a row needs.
const RowField = Field.pick({ id: true, contentType: true, groupId: true });

/** A property row: opens the property; selected rows are highlighted. */
export const PropertiesRow = ({
  className,
  original,
  ...props
}: ComponentProps<typeof RecordTable.Row>) => {
  const navigate = useNavigate();
  const selectedFieldIds = useAtomValue(selectedFieldIdsState);
  const field = RowField.safeParse(original).data;
  const isSelected = !!(field && selectedFieldIds[field.id]);

  return (
    <RecordTable.Row
      {...props}
      original={original}
      data-state={isSelected ? 'selected' : undefined}
      className={cn('cursor-pointer', className)}
      onClick={() => {
        if (field) void navigate(propertyEditPath(field));
      }}
    />
  );
};
