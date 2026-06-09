import {
  IconAlertTriangle,
  IconCalendar,
  IconDownload,
  IconExchange,
  IconHash,
  IconTag,
  IconUpload,
  IconUser,
} from '@tabler/icons-react';
import { type ElementType } from 'react';

export type SyncHistoryFilterKey =
  | 'user'
  | 'dateRange'
  | 'contentType'
  | 'contentId'
  | 'searchConsume'
  | 'searchSend'
  | 'searchResponse'
  | 'searchError';

export interface ISyncHistoryFilterValues {
  [key: string]: string | number | null;
  user: string | null;
  dateRange: string | null;
  contentType: string | number | null;
  contentId: string | number | null;
  searchConsume: string | number | null;
  searchSend: string | number | null;
  searchResponse: string | number | null;
  searchError: string | number | null;
}

export interface ISyncHistoryFilterField {
  key: SyncHistoryFilterKey;
  label: string;
  Icon: ElementType;
}

export const SYNC_HISTORY_FILTER_KEYS: SyncHistoryFilterKey[] = [
  'user',
  'dateRange',
  'contentType',
  'contentId',
  'searchConsume',
  'searchSend',
  'searchResponse',
  'searchError',
];

export const TEXT_FILTER_FIELDS: ISyncHistoryFilterField[] = [
  {
    key: 'contentType',
    label: 'Content Type',
    Icon: IconTag,
  },
  {
    key: 'contentId',
    label: 'Content ID',
    Icon: IconHash,
  },
  {
    key: 'searchConsume',
    label: 'Search Consume',
    Icon: IconDownload,
  },
  {
    key: 'searchSend',
    label: 'Search Send',
    Icon: IconUpload,
  },
  {
    key: 'searchResponse',
    label: 'Search Response',
    Icon: IconExchange,
  },
  {
    key: 'searchError',
    label: 'Search Error',
    Icon: IconAlertTriangle,
  },
];

export const PRIMARY_FILTER_FIELDS: ISyncHistoryFilterField[] = [
  {
    key: 'user',
    label: 'Assigned To',
    Icon: IconUser,
  },
  {
    key: 'dateRange',
    label: 'Date Range',
    Icon: IconCalendar,
  },
];
