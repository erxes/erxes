import { RECORD_CONTENT_TYPES, type RecordContentType } from 'erxes-ui';

// The record type of each list, by the `tableId` its `RecordTable` passes.
const RECORD_TABLE_CONTENT_TYPES = new Map<string, RecordContentType>([
  ['customers_record_table', 'core:customer'],
  ['companies_record_table', 'core:company'],
  ['team_members_record_table', 'core:user'],
  ['sales_deals_record_table', 'sales:deal'],
  ['frontline_tickets_record_table', 'frontline:ticket'],
]);

export const getRecordTableContentType = (tableId: string) =>
  RECORD_TABLE_CONTENT_TYPES.get(tableId);

export const isRecordContentType = (
  value: string,
): value is RecordContentType =>
  RECORD_CONTENT_TYPES.some((contentType) => contentType === value);
