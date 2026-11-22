import { z } from 'zod';
import type { ActionField } from '@erxes/core-contract';
import { appAction, type OAuthKeys, Text } from '@erxes/plugin-sdk/integrations';
import {
  appendRow,
  changeSpreadsheet,
  rangeOf,
  readSheet,
  type SheetParams,
  sheetIdOf,
  sheetParams,
  writeCells,
} from './googleSheetsApi';
import {
  changeable,
  columnLetter,
  type Columns,
  columnsOf,
  matchingRows,
  rowOf,
  rowRecord,
} from './googleSheetsRows';

const MAX_LISTED = 100;

const Values = z.record(z.string().trim().min(1).max(200), Text.pipe(z.string().max(50_000)));

const Filled = Values.refine(
  (values) => Object.keys(values).length > 0,
  'give at least one column',
);

const RowInput = sheetParams.extend({ values: Filled });

const MatchInput = sheetParams.extend({ match: Filled });

const ChangeInput = MatchInput.extend({ values: Filled });

const FindInput = sheetParams.extend({ match: Values.optional() });

type ChangeInput = z.output<typeof ChangeInput>;

export const SPREADSHEET_FIELD: ActionField = {
  key: 'spreadsheet',
  label: 'Spreadsheet',
  type: 'plugin_record',
  recordType: 'spreadsheet',
  required: true,
};

export const SHEET_FIELD: ActionField = {
  key: 'sheet',
  label: 'Sheet',
  type: 'plugin_record',
  recordType: 'sheet',
  dependsOn: 'spreadsheet',
  required: false,
  description: 'Blank: the first sheet',
};

const MATCH_FIELD: ActionField = {
  key: 'match',
  label: 'Match on',
  type: 'key_values',
  required: true,
  description: 'Rows whose columns hold these values, by column name; case is ignored',
};

const VALUES_FIELD: ActionField = {
  key: 'values',
  label: 'Columns',
  type: 'key_values',
  required: true,
  description: "Each column's name from the sheet's first row, and what goes in it",
};

const ROW_NUMBER = { key: 'rowNumber', label: 'Row number', type: 'number' } as const;

const UPDATED = { key: 'updated', label: 'Rows updated', type: 'number' } as const;

const rowNumberOf = (range: string) => Number(/!\D+(\d+)/.exec(range)?.[1] ?? 0);

const cellWrites = (
  params: SheetParams,
  columns: Columns,
  rowNumbers: number[],
  values: Record<string, string>,
) => {
  const targets = Object.entries(values).map(([column, value]) => ({
    letter: columnLetter(columns.at(column)),
    value,
  }));

  return rowNumbers.flatMap((rowNumber) =>
    targets.map(({ letter, value }) => ({
      range: rangeOf(params.sheet, `${letter}${rowNumber}`),
      values: [[value]],
    })),
  );
};

const updateMatches = async (keys: OAuthKeys, input: ChangeInput) => {
  const { header, data } = await readSheet(keys, input);
  const columns = columnsOf(header);

  const rowNumbers = changeable(matchingRows(columns, data, input.match)).map(
    ({ rowNumber }) => rowNumber,
  );

  await writeCells(keys, input.spreadsheet, cellWrites(input, columns, rowNumbers, input.values));

  return { columns, rowNumbers };
};

export const addRow = appAction<OAuthKeys, z.output<typeof RowInput>>({
  key: 'add_row',
  label: 'Add a row',
  description: 'Add a row under the last one, filling columns by their names',
  fields: [SPREADSHEET_FIELD, SHEET_FIELD, VALUES_FIELD],
  outputs: [ROW_NUMBER],
  input: RowInput,
  async run({ client: keys, input }) {
    const { header } = await readSheet(keys, input, 1);
    const range = await appendRow(keys, input, rowOf(columnsOf(header), input.values));

    return { rowNumber: rowNumberOf(range) };
  },
});

export const addOrUpdateRow = appAction<OAuthKeys, ChangeInput>({
  key: 'add_or_update_row',
  label: 'Add or update a row',
  description: 'Update the rows that match, or add one when none does',
  fields: [SPREADSHEET_FIELD, SHEET_FIELD, MATCH_FIELD, VALUES_FIELD],
  outputs: [ROW_NUMBER, { key: 'added', label: 'Row added', type: 'boolean' }, UPDATED],
  input: ChangeInput,
  async run({ client: keys, input }) {
    const { columns, rowNumbers } = await updateMatches(keys, input);
    const [first] = rowNumbers;

    if (first) return { rowNumber: first, added: false, updated: rowNumbers.length };

    const range = await appendRow(keys, input, rowOf(columns, { ...input.match, ...input.values }));

    return { rowNumber: rowNumberOf(range), added: true, updated: 0 };
  },
});

export const updateRows = appAction<OAuthKeys, ChangeInput>({
  key: 'update_rows',
  label: 'Update rows',
  description: 'Change columns in every row that matches',
  fields: [SPREADSHEET_FIELD, SHEET_FIELD, MATCH_FIELD, VALUES_FIELD],
  outputs: [UPDATED, { ...ROW_NUMBER, label: 'First row number' }],
  input: ChangeInput,
  async run({ client: keys, input }) {
    const { rowNumbers } = await updateMatches(keys, input);

    return { updated: rowNumbers.length, rowNumber: rowNumbers[0] ?? 0 };
  },
});

export const findRows = appAction<OAuthKeys, z.output<typeof FindInput>>({
  key: 'find_rows',
  label: 'Find rows',
  description: "Find the rows that match. The first one's columns arrive under Row, by their names",
  fields: [
    SPREADSHEET_FIELD,
    SHEET_FIELD,
    {
      ...MATCH_FIELD,
      required: false,
      description: `${MATCH_FIELD.description}. Blank: every row`,
    },
  ],
  outputs: [
    { key: 'count', label: 'Rows found', type: 'number' },
    { ...ROW_NUMBER, label: 'First row number' },
    { key: 'rows', label: `Rows found (the first ${MAX_LISTED}, as JSON)`, type: 'text' },
  ],
  input: FindInput,
  async run({ client: keys, input }) {
    const { header, data } = await readSheet(keys, input);
    const columns = columnsOf(header);
    const found = matchingRows(columns, data, input.match ?? {});

    const records = found
      .slice(0, MAX_LISTED)
      .map(({ row, rowNumber }) => ({ ...rowRecord(columns.names, row), rowNumber }));

    return {
      count: found.length,
      rowNumber: found[0]?.rowNumber ?? 0,
      row: records[0] ?? {},
      rows: JSON.stringify(records),
    };
  },
});

export const deleteRows = appAction<OAuthKeys, z.output<typeof MatchInput>>({
  key: 'delete_rows',
  label: 'Delete rows',
  description: 'Delete every row that matches; the rows under them move up',
  fields: [SPREADSHEET_FIELD, SHEET_FIELD, MATCH_FIELD],
  outputs: [{ key: 'deleted', label: 'Rows deleted', type: 'number' }],
  input: MatchInput,
  async run({ client: keys, input }) {
    const { header, data } = await readSheet(keys, input);
    const rows = changeable(matchingRows(columnsOf(header), data, input.match));

    if (!rows.length) return { deleted: 0 };

    const sheetId = await sheetIdOf(keys, input);

    await changeSpreadsheet(
      keys,
      input.spreadsheet,
      rows.toReversed().map(({ rowNumber }) => ({
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowNumber - 1, endIndex: rowNumber },
        },
      })),
    );

    return { deleted: rows.length };
  },
});
