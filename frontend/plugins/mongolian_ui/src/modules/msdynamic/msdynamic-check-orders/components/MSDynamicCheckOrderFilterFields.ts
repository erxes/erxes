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
    label: 'Brand',
    Icon: IconSearch,
  },
  {
    key: 'user',
    label: 'User',
    Icon: IconUser,
  },
  {
    key: 'paidDateRange',
    label: 'Paid Date Range',
    Icon: IconCalendar,
  },
  {
    key: 'createdAtRange',
    label: 'Created Date Range',
    Icon: IconCalendar,
  },
  {
    key: 'number',
    label: 'Number',
    Icon: IconSearch,
  },
];

export const TEXT_FILTER_FIELDS: ICheckOrderFilterField[] = [
  {
    key: 'number',
    label: 'Number',
    Icon: IconSearch,
  },
];
