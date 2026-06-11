import {
  Icon,
  IconCalendarEvent,
  IconChevronDown,
  IconCircleCheck,
  IconLink,
  IconListCheck,
  IconNumbers,
  IconPaperclip,
  IconPhoneSpark,
  IconTextScan2,
  IconTextSize,
} from '@tabler/icons-react';

export const FIELD_ICON_BY_TYPE: Record<string, Icon> = {
  number: IconNumbers,
  date: IconCalendarEvent,
  select: IconChevronDown,
  multiSelect: IconChevronDown,
  radio: IconCircleCheck,
  check: IconListCheck,
  relation: IconLink,
  phone: IconPhoneSpark,
  textarea: IconTextScan2,
  file: IconPaperclip,
  text: IconTextSize,
};
