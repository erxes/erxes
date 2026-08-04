import { IconCalendar, IconSearch, IconUser } from '@tabler/icons-react';
import { ElementType } from 'react';

export type TCheckOrderFilterKey =
  | 'brandId'
  | 'user'
  | 'number'
  | 'paidDateRange'
  | 'createdAtRange';

export type ICheckOrderFilterValues = Record<
  TCheckOrderFilterKey,
  string | number | null
>;

export interface ICheckOrderFilterField {
  key: TCheckOrderFilterKey;
  label: string;
  Icon: ElementType;
}

export const CHECK_ORDER_FILTER_KEYS: TCheckOrderFilterKey[] = [
  'brandId',
  'user',
  'number',
  'paidDateRange',
  'createdAtRange',
];

export const PRIMARY_FILTER_FIELDS: ICheckOrderFilterField[] = [
  {
    key: 'brandId',
    label: 'brand',
    Icon: IconSearch,
  },
  {
    key: 'user',
    label: 'user',
    Icon: IconUser,
  },
  {
    key: 'paidDateRange',
    label: 'paid-date-range',
    Icon: IconCalendar,
  },
  {
    key: 'createdAtRange',
    label: 'created-date-range',
    Icon: IconCalendar,
  },
  {
    key: 'number',
    label: 'number',
    Icon: IconSearch,
  },
];

export const TEXT_FILTER_FIELDS: ICheckOrderFilterField[] = [
  {
    key: 'number',
    label: 'number',
    Icon: IconSearch,
  },
];
