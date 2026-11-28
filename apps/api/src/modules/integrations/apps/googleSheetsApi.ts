import { z } from 'zod';
import {
  type AppRecords,
  record,
  type OAuthKeys,
  gatewayHttp,
  parse,
  type ClientOptions,
  GatewayError,
} from '@erxes/plugin-sdk/integrations';
import { Cell, NO_SHEET, refuse, type Row } from './googleSheetsRows';

const NAME = 'Google Sheets';

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

const ID = /^[\w-]{20,100}$/;

const fromLink = (value: string) => /\/spreadsheets\/d\/([\w-]+)/.exec(value)?.[1] ?? value;

export const Spreadsheet = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .transform(fromLink)
  .pipe(z.string().regex(ID, 'a Google Sheets link or its id'));

export const SheetName = z.string().trim().min(1).max(100);

export const sheetParams = z.object({
  spreadsheet: record('Spreadsheet', 'spreadsheet', { schema: Spreadsheet }),
  sheet: record('Sheet (blank: the first sheet)', 'sheet', {
    schema: z.string().trim().max(100),
    dependsOn: 'spreadsheet',
  }).optional(),
});

export type SheetParams = z.output<typeof sheetParams>;

const Values = z.object({ values: z.array(z.array(Cell)).optional() });

const Profile = z.object({ sub: z.string().min(1), email: z.string().min(1) });

const googleMessage = (text: string) => {
  const quoted = /"message":\s*("(?:[^"\\]|\\.)*")/.exec(text)?.[1];

  if (!quoted) return null;

  try {
    return z.string().min(1).parse(JSON.parse(quoted));
  } catch {
    return null;
  }
};

const refusal = (status: number | null, said: string | null) => {
  switch (status) {
    case 400:
      return said?.startsWith('Unable to parse range') ? NO_SHEET : said;
    case 401:
      return 'Google turned down the sign-in: connect Google Sheets again';
    case 403:
      if (
        said?.includes('Drive API has not been used') ||
        (said?.includes('Drive API') && said.includes('disabled'))
      )
        return 'Turn on the Google Drive API in your Google Cloud project to list spreadsheets';

      return said?.includes('insufficient authentication scopes')
        ? 'This connection was made with fewer permissions: connect Google Sheets again'
        : "The signed-in Google account can't edit this spreadsheet: share it with that account as an editor, and turn on the Google Sheets API in your Google Cloud project";
    case 404:
      return "Google Sheets can't find this spreadsheet: check its link";
    case 429:
      return 'Google Sheets is limiting requests from this app: it tries again later';
    default:
      return said;
  }
};

const send = async (
  accessToken: string,
  url: string,
  options: ClientOptions = {},
  body?: unknown,
) => {
  try {
    return await gatewayHttp(
      NAME,
      '',
      options,
    )(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      ...(body !== undefined && { method: 'POST', body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (!(error instanceof GatewayError)) throw error;

    throw new GatewayError(
      refusal(error.status, googleMessage(error.message)) ?? error.message,
      error.status,
    );
  }
};

const post = (keys: OAuthKeys, url: URL | string, body: unknown) =>
  send(keys.accessToken, url.toString(), {}, body);

export const accountOf = async (accessToken: string, options: ClientOptions = {}) => {
  const profile = parse(
    NAME,
    Profile,
    await send(accessToken, 'https://www.googleapis.com/oauth2/v3/userinfo', options),
    'no account email',
  );

  return { id: profile.sub, name: profile.email };
};

/** `cells` (`A2:ZZZ`, `C5`) on the named sheet, or on the first one. */
export const rangeOf = (sheet: string | undefined, cells: string) =>
  sheet ? `'${sheet.replaceAll("'", "''")}'!${cells}` : cells;

const spreadsheetUrl = (spreadsheet: string, path = '') =>
  new URL(`${BASE}/${encodeURIComponent(spreadsheet)}${path}`);

const valuesUrl = (params: SheetParams, cells: string, verb = '') =>
  spreadsheetUrl(
    params.spreadsheet,
    `/values/${encodeURIComponent(rangeOf(params.sheet, cells))}${verb}`,
  );

export const readSheet = async (keys: OAuthKeys, params: SheetParams, rows?: number) => {
  const url = valuesUrl(params, rows ? `A1:ZZZ${rows}` : 'A:ZZZ');

  url.searchParams.set('valueRenderOption', 'UNFORMATTED_VALUE');
  url.searchParams.set('dateTimeRenderOption', 'FORMATTED_STRING');

  const { values = [] } = parse(
    NAME,
    Values,
    await send(keys.accessToken, url.toString()),
    'no cell values',
  );

  const [header = [], ...data] = values;

  return { header, data };
};

const Appended = z.object({ updates: z.object({ updatedRange: z.string() }) });

/** Adds `row` under the sheet's last row; answers the range it landed in (`Sheet1!A12:D12`). */
export const appendRow = async (keys: OAuthKeys, params: SheetParams, row: Row) => {
  const url = valuesUrl(params, 'A:ZZZ', ':append');

  url.searchParams.set('valueInputOption', 'USER_ENTERED');
  url.searchParams.set('insertDataOption', 'INSERT_ROWS');

  return parse(NAME, Appended, await post(keys, url, { values: [row] }), 'no added row').updates
    .updatedRange;
};

/** Writes each range's values as a member would type them, in one request. */
export const writeCells = async (
  keys: OAuthKeys,
  spreadsheet: string,
  data: { range: string; values: Row[] }[],
) => {
  if (data.length)
    await post(keys, spreadsheetUrl(spreadsheet, '/values:batchUpdate'), {
      valueInputOption: 'USER_ENTERED',
      data,
    });
};

export const clearCells = async (keys: OAuthKeys, params: SheetParams, cells: string) => {
  await post(keys, valuesUrl(params, cells, ':clear'), {});
};

const Tabs = z.object({
  properties: z.object({ title: z.string().min(1) }).optional(),
  sheets: z
    .array(z.object({ properties: z.object({ sheetId: z.int(), title: z.string() }) }))
    .default([]),
});

const tabsOf = async (keys: OAuthKeys, spreadsheet: string) => {
  const url = spreadsheetUrl(spreadsheet);

  url.searchParams.set('fields', 'properties.title,sheets.properties(sheetId,title)');

  return parse(NAME, Tabs, await send(keys.accessToken, url.toString()), 'no sheets');
};

const Files = z.object({
  files: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
});

const SPREADSHEETS = `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;

/** `text` inside a Drive query's single quotes. */
const quoted = (text: string) => text.replaceAll('\\', '\\\\').replaceAll("'", String.raw`\'`);

/**
 * For the builder's pickers: the spreadsheets the account can see (most recently changed
 * first, or those whose name holds `search`), and a spreadsheet's sheets (tabs) in order.
 */
export const SHEETS_RECORDS: AppRecords<OAuthKeys> = {
  spreadsheet: {
    async list({ client: keys, search }) {
      const url = new URL('https://www.googleapis.com/drive/v3/files');

      url.searchParams.set(
        'q',
        search ? `${SPREADSHEETS} and name contains '${quoted(search)}'` : SPREADSHEETS,
      );
      url.searchParams.set('orderBy', 'modifiedTime desc');
      url.searchParams.set('pageSize', '100');
      url.searchParams.set('fields', 'files(id,name)');

      const { files } = parse(
        NAME,
        Files,
        await send(keys.accessToken, url.toString()),
        'no files',
      );

      return files.map(({ id, name }) => ({ value: id, label: name }));
    },
  },
  sheet: {
    async list({ client: keys, parents: [link] }) {
      const spreadsheet = Spreadsheet.safeParse(link);

      if (!spreadsheet.success) return [];

      const { sheets } = await tabsOf(keys, spreadsheet.data);

      return sheets.map(({ properties }) => ({ value: properties.title, label: properties.title }));
    },
  },
};

export const tabOf = async (keys: OAuthKeys, params: SheetParams) => {
  const { properties, sheets } = await tabsOf(keys, params.spreadsheet);

  const wanted = params.sheet?.toLowerCase();

  const tab = wanted
    ? sheets.find((sheet) => sheet.properties.title.toLowerCase() === wanted)
    : sheets[0];

  if (!tab) throw refuse(NO_SHEET);

  return {
    spreadsheetName: properties?.title,
    sheetId: tab.properties.sheetId,
    sheetName: tab.properties.title,
  };
};

/** The numeric id Google's structural changes take for the named sheet, or the first one. */
export const sheetIdOf = async (keys: OAuthKeys, params: SheetParams) =>
  (await tabOf(keys, params)).sheetId;

const Replies = z.object({
  replies: z.array(
    z.object({ addSheet: z.object({ properties: z.object({ sheetId: z.int() }) }) }),
  ),
});

export const addTab = async (keys: OAuthKeys, spreadsheet: string, title: string) => {
  const { replies } = parse(
    NAME,
    Replies,
    await post(keys, spreadsheetUrl(spreadsheet, ':batchUpdate'), {
      requests: [{ addSheet: { properties: { title } } }],
    }),
    'no added sheet',
  );

  return replies[0]?.addSheet.properties.sheetId ?? 0;
};

/** Runs structural changes (deleting rows or sheets) in one request. */
export const changeSpreadsheet = async (
  keys: OAuthKeys,
  spreadsheet: string,
  requests: Record<string, unknown>[],
) => {
  if (requests.length) await post(keys, spreadsheetUrl(spreadsheet, ':batchUpdate'), { requests });
};

const Created = z.object({ spreadsheetId: z.string().min(1), spreadsheetUrl: z.url() });

export const createSpreadsheet = async (keys: OAuthKeys, title: string, sheet?: string) =>
  parse(
    NAME,
    Created,
    await post(keys, BASE, {
      properties: { title },
      ...(sheet && { sheets: [{ properties: { title: sheet } }] }),
    }),
    'no spreadsheet',
  );

export const spreadsheetLink = (spreadsheet: string, sheetId: number) =>
  `https://docs.google.com/spreadsheets/d/${spreadsheet}/edit#gid=${sheetId}`;
