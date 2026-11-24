import {
  IconBuilding,
  IconCalendar,
  IconHash,
  IconLetterCase,
  IconList,
  IconPackage,
  IconSelector,
  IconTags,
  IconToggleLeft,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import type { TConditionField } from './conditions';

const FIELD_ICONS: Partial<Record<string, typeof IconHash>> = {
  text: IconLetterCase,
  number: IconHash,
  date: IconCalendar,
  boolean: IconToggleLeft,
  select: IconSelector,
  member: IconUser,
  tags: IconTags,
  customer: IconUserCircle,
  company: IconBuilding,
  product: IconPackage,
  list: IconList,
};

/** A field's icon on pickers and chips: its own, else its type's. */
export const FieldIcon = ({
  field,
  className,
}: {
  field: Pick<TConditionField, 'type' | 'icon'>;
  className?: string;
}) => {
  const Icon = field.icon ?? FIELD_ICONS[field.type] ?? IconLetterCase;

  return <Icon className={className} />;
};
