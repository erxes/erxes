import { z } from 'zod';
import type { ActionField } from '@erxes/core-contract';
import { appAction, type OAuthKeys } from '@erxes/plugin-sdk/integrations';
import { SHEET_FIELD, SPREADSHEET_FIELD } from './googleSheetsActions';
import {
  addTab,
  changeSpreadsheet,
  clearCells,
  createSpreadsheet,
  rangeOf,
  SheetName,
  sheetIdOf,
  sheetParams,
  Spreadsheet,
  spreadsheetLink,
  writeCells,
} from './googleSheetsApi';

const Names = z
  .union([z.string(), z.array(z.string())])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split(',')).map((name) => name.trim()).filter(Boolean),
  )
  .pipe(z.array(z.string().max(200)).max(500));

const ClearInput = sheetParams.extend({ header: z.boolean().optional() });

const TabInput = z.object({
  spreadsheet: Spreadsheet,
  title: SheetName,
  columns: Names.optional(),
});

const DeleteTabInput = z.object({ spreadsheet: Spreadsheet, sheet: SheetName });

const SpreadsheetInput = z.object({
  title: z.string().trim().min(1).max(200),
  sheet: SheetName.optional(),
  columns: Names.optional(),
});

const NAME_FIELD: ActionField = { key: 'title', label: 'Name', type: 'text', required: true };

const COLUMNS_FIELD: ActionField = {
  key: 'columns',
  label: 'Column names',
  type: 'text',
  required: false,
  placeholder: 'Name, Email, Phone',
  description: 'Comma separated; they go in the first row',
};

const LINK = { key: 'link', label: 'Link', type: 'text' } as const;

const writeHeader = async (
  keys: OAuthKeys,
  spreadsheet: string,
  sheet: string | undefined,
  columns: string[] = [],
) => {
  if (columns.length)
    await writeCells(keys, spreadsheet, [{ range: rangeOf(sheet, 'A1'), values: [columns] }]);
};

export const clearSheet = appAction<OAuthKeys, z.output<typeof ClearInput>>({
  key: 'clear_sheet',
  label: 'Clear the sheet',
  description: 'Empty every row under the column names; the sheet keeps its formatting',
  fields: [
    SPREADSHEET_FIELD,
    SHEET_FIELD,
    { key: 'header', label: 'Also clear the column names', type: 'boolean', required: false },
  ],
  input: ClearInput,
  async run({ client: keys, input }) {
    await clearCells(keys, input, input.header ? 'A:ZZZ' : 'A2:ZZZ');

    return {};
  },
});

export const addSheet = appAction<OAuthKeys, z.output<typeof TabInput>>({
  key: 'add_sheet',
  label: 'Add a sheet',
  description: 'Add a sheet (tab) to a spreadsheet, with its column names',
  fields: [SPREADSHEET_FIELD, NAME_FIELD, COLUMNS_FIELD],
  outputs: [{ ...LINK, label: 'Sheet link' }],
  input: TabInput,
  async run({ client: keys, input }) {
    const sheetId = await addTab(keys, input.spreadsheet, input.title);

    await writeHeader(keys, input.spreadsheet, input.title, input.columns);

    return { link: spreadsheetLink(input.spreadsheet, sheetId) };
  },
});

export const deleteSheet = appAction<OAuthKeys, z.output<typeof DeleteTabInput>>({
  key: 'delete_sheet',
  label: 'Delete a sheet',
  description: 'Delete a sheet (tab) and everything on it',
  fields: [SPREADSHEET_FIELD, { ...SHEET_FIELD, required: true, description: 'Its name' }],
  input: DeleteTabInput,
  async run({ client: keys, input }) {
    const sheetId = await sheetIdOf(keys, input);

    await changeSpreadsheet(keys, input.spreadsheet, [{ deleteSheet: { sheetId } }]);

    return {};
  },
});

export const createSpreadsheetAction = appAction<OAuthKeys, z.output<typeof SpreadsheetInput>>({
  key: 'create_spreadsheet',
  label: 'Create a spreadsheet',
  description: "Create a spreadsheet in the connected Google account's Drive",
  fields: [
    NAME_FIELD,
    {
      key: 'sheet',
      label: 'First sheet',
      type: 'text',
      required: false,
      description: 'Blank: Sheet1',
    },
    COLUMNS_FIELD,
  ],
  outputs: [
    { key: 'spreadsheetId', label: 'Spreadsheet id', type: 'text', recordType: 'spreadsheet' },
    { ...LINK, label: 'Spreadsheet link' },
  ],
  input: SpreadsheetInput,
  async run({ client: keys, input }) {
    const made = await createSpreadsheet(keys, input.title, input.sheet);

    await writeHeader(keys, made.spreadsheetId, input.sheet, input.columns);

    return { spreadsheetId: made.spreadsheetId, link: made.spreadsheetUrl };
  },
});
