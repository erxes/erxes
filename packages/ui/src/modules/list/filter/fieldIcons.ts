import {
  IconCalendar,
  IconHash,
  IconLetterCase,
  IconSelector,
  IconTags,
  IconToggleLeft,
  IconUser,
} from '@tabler/icons-react';
import type { TListFilterField } from '../ListFilter';

/**
 * A field's icon in the filter menu and on its chips, by type, unless it brings its own:
 * `field.icon ?? FIELD_ICONS[field.type]`.
 */
export const FIELD_ICONS: Record<TListFilterField['type'], typeof IconHash> = {
  text: IconLetterCase,
  number: IconHash,
  date: IconCalendar,
  boolean: IconToggleLeft,
  select: IconSelector,
  member: IconUser,
  tags: IconTags,
};
