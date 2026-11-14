import type { FieldType } from '@erxes/core-contract';
import { IconComponent } from 'erxes-ui';
import { FIELD_TYPES_OBJECT } from '../fieldTypes';

/** A property's own icon, or its field type's when it has none. */
export const FieldIcon = ({ icon, type }: { icon?: string | null; type: FieldType }) => {
  const TypeIcon = FIELD_TYPES_OBJECT[type].icon;

  return (
    <span className="flex shrink-0 text-muted-foreground">
      {icon ? <IconComponent name={icon} className="size-4" /> : <TypeIcon className="size-4" />}
    </span>
  );
};
