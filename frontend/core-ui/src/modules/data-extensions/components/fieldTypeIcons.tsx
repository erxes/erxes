import {
  IconAlignLeft,
  IconArrowsRightLeft,
  IconBraces,
  IconCalendar,
  IconCalendarTime,
  IconCircleDot,
  IconCoin,
  IconHash,
  IconId,
  IconLetterCase,
  IconLink,
  IconLinkPlus,
  IconListCheck,
  IconMail,
  IconMailPlus,
  IconMapPin,
  IconPaperclip,
  IconPercentage,
  IconPhone,
  IconPhonePlus,
  IconStar,
  IconToggleLeft,
  IconUserCircle,
  TablerIcon,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { DataExtensionFieldType } from 'ui-modules';

/** One glyph per field type, shared by the picker, the table and the map. */
export const FIELD_TYPE_ICONS: Record<DataExtensionFieldType, TablerIcon> = {
  text: IconLetterCase,
  longText: IconAlignLeft,
  number: IconHash,
  boolean: IconToggleLeft,
  date: IconCalendar,
  select: IconCircleDot,
  multiSelect: IconListCheck,
  email: IconMail,
  url: IconLink,
  phone: IconPhone,
  relation: IconArrowsRightLeft,
  currency: IconCoin,
  dateTime: IconCalendarTime,
  rating: IconStar,
  percent: IconPercentage,
  address: IconMapPin,
  fullName: IconId,
  links: IconLinkPlus,
  emails: IconMailPlus,
  phones: IconPhonePlus,
  files: IconPaperclip,
  member: IconUserCircle,
  json: IconBraces,
};

/** GraphQL type a field gets on the typed endpoint, shown in previews. */
export const FIELD_TYPE_GRAPHQL: Record<DataExtensionFieldType, string> = {
  text: 'String',
  longText: 'String',
  number: 'Float',
  boolean: 'Boolean',
  date: 'Date',
  select: 'String',
  multiSelect: '[String!]',
  email: 'String',
  url: 'String',
  phone: 'String',
  relation: 'Record',
  currency: 'DataExtensionCurrency',
  dateTime: 'Date',
  rating: 'Int',
  percent: 'Float',
  address: 'DataExtensionAddress',
  fullName: 'DataExtensionFullName',
  links: '[DataExtensionLink!]',
  emails: '[String!]',
  phones: '[String!]',
  files: '[DataExtensionFile!]',
  member: 'TeamMember',
  json: 'JSON',
};

export const FieldTypeIcon = ({
  type,
  className,
}: {
  type: DataExtensionFieldType;
  className?: string;
}) => {
  const Icon = FIELD_TYPE_ICONS[type];

  return (
    <Icon aria-hidden="true" className={cn('size-4 shrink-0', className)} />
  );
};
