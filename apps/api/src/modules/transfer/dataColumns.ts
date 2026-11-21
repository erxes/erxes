import type { TransferColumn } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import type { DataFieldRow } from '~/modules/dataExtensions/definitions';
import { fieldsOf } from '~/modules/dataExtensions/definitions';
import { DATA_PATH } from '~/modules/dataExtensions/hostFilters';
import { valuesByRecord } from '~/modules/dataExtensions/hostValues.service';

/**
 * Data Extensions fields as import and export columns (`data.<key>`), beside the custom
 * fields' `customFields.<id>`. A cell is written through the fields' own checks on import.
 */

export type DataColumnField = Pick<DataFieldRow, 'key' | 'type' | 'options'>;

/** Types a cell's text can say: the rest (composites, files, relations) only export. */
const IMPORTABLE: ReadonlySet<string> = new Set([
  'text',
  'longText',
  'email',
  'phone',
  'url',
  'number',
  'percent',
  'rating',
  'boolean',
  'date',
  'dateTime',
  'select',
  'multiSelect',
  'textList',
]);

/** Core's record type of an import or export list. */
export const DATA_RECORD_TYPES = {
  customer: 'core.customer',
  lead: 'core.customer',
  company: 'core.company',
} as const;

/** The list's Data Extensions fields as columns; a plugin's fields export only. */
export const dataColumns = async (
  client: Db,
  list: keyof typeof DATA_RECORD_TYPES,
): Promise<(TransferColumn & { aliases: string[]; dataField: DataColumnField })[]> =>
  (await fieldsOf(client, DATA_RECORD_TYPES[list])).map((field) => ({
    key: `${DATA_PATH}${field.key}`,
    label: field.label,
    group: 'custom',
    importable: !field.plugin && IMPORTABLE.has(field.type),
    exportable: true,
    default: false,
    aliases: [field.key.toLowerCase()],
    dataField: field,
  }));

/** The Data Extensions values of a page of exported records, when the export has their columns. */
export const exportedValues = (
  client: Db,
  list: keyof typeof DATA_RECORD_TYPES,
  ids: string[],
  keys: string[],
) =>
  keys.some((key) => key.startsWith(DATA_PATH))
    ? valuesByRecord(client, DATA_RECORD_TYPES[list], ids)
    : Promise.resolve(new Map<string, Record<string, unknown>>());
