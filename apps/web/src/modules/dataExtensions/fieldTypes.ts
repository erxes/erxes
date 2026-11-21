import type { DataExtensionFieldType } from '@erxes/core-contract';
import type { orpc } from '@erxes/core-contract/client';
import {
  IconCalculator,
  IconAt,
  IconBraces,
  IconCalendar,
  IconCalendarTime,
  IconCurrencyDollar,
  IconFileStack,
  IconHash,
  IconLetterCase,
  IconLink,
  IconLinkPlus,
  IconList,
  IconListCheck,
  IconListDetails,
  IconMail,
  IconMapPin,
  IconMath,
  IconNumber,
  IconPercentage,
  IconPhone,
  IconPhonePlus,
  IconStar,
  IconTextSize,
  IconToggleRight,
  IconUser,
  IconUserCircle,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';

/** A type a field converts to, its values carried over where they fit. */
export type ConvertibleType = Parameters<typeof orpc.dataChanges.convert.call>[0]['type'];

interface TypeLook {
  icon: Icon;
  /** Its name in English; `types.<type>` in the member's language. */
  label: string;
}

/** Every field type's icon and name, in the order the type picker lists them. */
export const FIELD_TYPES = {
  text: { icon: IconLetterCase, label: 'Text' },
  longText: { icon: IconTextSize, label: 'Long text' },
  number: { icon: IconNumber, label: 'Number' },
  percent: { icon: IconPercentage, label: 'Percent' },
  currency: { icon: IconCurrencyDollar, label: 'Currency' },
  rating: { icon: IconStar, label: 'Rating' },
  boolean: { icon: IconToggleRight, label: 'Yes or no' },
  date: { icon: IconCalendar, label: 'Date' },
  dateTime: { icon: IconCalendarTime, label: 'Date and time' },
  select: { icon: IconList, label: 'Select' },
  multiSelect: { icon: IconListCheck, label: 'Multi-select' },
  textList: { icon: IconListDetails, label: 'Text list' },
  email: { icon: IconMail, label: 'Email' },
  phone: { icon: IconPhone, label: 'Phone' },
  url: { icon: IconWorld, label: 'Link' },
  emails: { icon: IconAt, label: 'Emails' },
  phones: { icon: IconPhonePlus, label: 'Phones' },
  links: { icon: IconLink, label: 'Links' },
  fullName: { icon: IconUserCircle, label: 'Full name' },
  address: { icon: IconMapPin, label: 'Address' },
  member: { icon: IconUser, label: 'Team member' },
  files: { icon: IconFileStack, label: 'Files' },
  relation: { icon: IconLinkPlus, label: 'Relation' },
  json: { icon: IconBraces, label: 'JSON' },
  autoNumber: { icon: IconHash, label: 'Auto number' },
  formula: { icon: IconMath, label: 'Formula' },
  rollup: { icon: IconCalculator, label: 'Rollup' },
} satisfies Record<DataExtensionFieldType, TypeLook>;

export const isFieldType = (type: string): type is DataExtensionFieldType =>
  Object.hasOwn(FIELD_TYPES, type);

/** The types in the picker's order. */
export const FIELD_TYPE_LIST: DataExtensionFieldType[] =
  Object.keys(FIELD_TYPES).filter(isFieldType);

/** Types the API computes or numbers: never typed in. */
export const isComputedType = (type: DataExtensionFieldType) =>
  type === 'formula' || type === 'rollup' || type === 'autoNumber';

const CONVERTIBLE = {
  text: true,
  longText: true,
  email: true,
  phone: true,
  url: true,
  select: true,
  multiSelect: true,
  number: true,
  percent: true,
  rating: true,
  boolean: true,
  date: true,
  dateTime: true,
} satisfies Record<ConvertibleType, true>;

const isConvertible = (type: string): type is ConvertibleType => Object.hasOwn(CONVERTIBLE, type);

/** The types a field of `type` converts to: the other convertible ones. */
export const convertTargets = (type: DataExtensionFieldType): ConvertibleType[] =>
  isConvertible(type)
    ? Object.keys(CONVERTIBLE)
        .filter(isConvertible)
        .filter((target) => target !== type)
    : [];

/** A number with bounds: number, percent and currency amounts. */
export const isNumeric = (type: DataExtensionFieldType) =>
  type === 'number' || type === 'percent' || type === 'currency';

/** Types whose values the API can keep unique. */
export const canBeUnique = (type: DataExtensionFieldType) =>
  type === 'text' || type === 'email' || type === 'phone' || type === 'url' || type === 'number';
