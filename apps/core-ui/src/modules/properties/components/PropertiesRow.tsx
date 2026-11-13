import { cn, RecordTable } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import type { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectedFieldIdsState } from '../states';
import { FieldLocation, propertyEditPath } from './propertiesColumns';

/** A property's row; clicking it opens the property. */
export const PropertiesRow = ({
  className,
  original,
  ...props
}: ComponentProps<typeof RecordTable.Row>) => {
  const navigate = useNavigate();
  const selectedFieldIds = useAtomValue(selectedFieldIdsState);
  const parsed = FieldLocation.safeParse(original);
  const field = parsed.success ? parsed.data : undefined;
  const isSelected = Boolean(field && selectedFieldIds[field.id]);

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
