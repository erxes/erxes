import {
  IconBuilding,
  IconCalendar,
  IconHash,
  IconLetterCase,
  IconList,
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
  list: IconList,
};

/** A field's icon in the pickers and on its chips: its own, else its type's. */
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
