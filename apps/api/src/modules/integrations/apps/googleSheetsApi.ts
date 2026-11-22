import { z } from 'zod';
import { sha256 } from '~/lib/crypto';
import { field, type OAuthKeys } from '../define';
import { gatewayHttp, parse } from '../gateways/http';
import { type DriverOptions, GatewayError } from '../gateways/types';

const NAME = 'Google Sheets';

const ID = /^[\w-]{20,100}$/;

const fromLink = (value: string) => /\/spreadsheets\/d\/([\w-]+)/.exec(value)?.[1] ?? value;

export const sheetParams = z.object({
  spreadsheet: field(
    'Spreadsheet link or id',
    z
      .string()
      .trim()
      .min(1)
      .max(500)
      .transform(fromLink)
      .pipe(z.string().regex(ID, 'a Google Sheets link or its id')),
  ),
  sheet: field('Sheet (blank: the first sheet)', z.string().trim().max(100)).optional(),
});

export type SheetParams = z.output<typeof sheetParams>;

const Cell = z.union([z.string(), z.number(), z.boolean()]);

const Values = z.object({ values: z.array(z.array(Cell)).optional() });

type Value = z.infer<typeof Cell>;

type Row = Value[];

const Profile = z.object({ email: z.string().min(1) });

const refusal = (status: number | null) => {
  switch (status) {
    case 400:
      return 'This spreadsheet has no sheet with that name';
    case 401:
      return 'Google turned down the sign-in: connect Google Sheets again';
    case 403:
      return "The signed-in Google account can't read this spreadsheet: share it with that account, and turn on the Google Sheets API in your Google Cloud project";
    case 404:
      return "Google Sheets can't find this spreadsheet: check its link";
    case 429:
      return 'Google Sheets is limiting requests from this app: it tries again later';
    default:
      return null;
  }
};

const send = async (accessToken: string, url: string, options: DriverOptions = {}) => {
  try {
    return await gatewayHttp(
      NAME,
      '',
      options,
    )(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    if (!(error instanceof GatewayError)) throw error;

    throw new GatewayError(refusal(error.status) ?? error.message, error.status);
  }
};

export const accountOf = async (accessToken: string, options: DriverOptions = {}) =>
  parse(
    NAME,
    Profile,
    await send(accessToken, 'https://www.googleapis.com/oauth2/v3/userinfo', options),
    'no account email',
  ).email;

const rangeOf = (sheet: string | undefined, rows?: number) => {
  const cells = rows ? `A1:ZZZ${rows}` : 'A:ZZZ';

  return sheet ? `'${sheet.replaceAll("'", "''")}'!${cells}` : cells;
};

export const readSheet = async (keys: OAuthKeys, params: SheetParams, rows?: number) => {
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(params.spreadsheet)}/values/${encodeURIComponent(rangeOf(params.sheet, rows))}`,
  );

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

const columnLetter = (index: number): string =>
  (index >= 26 ? columnLetter(Math.floor(index / 26) - 1) : '') +
  String.fromCodePoint(65 + (index % 26));

export const columnNames = (header: Row) => {
  const taken = new Set<string>();

  return header.map((cell, index) => {
    const text = String(cell).trim();
    const name = text && !taken.has(text) ? text : columnLetter(index);

    taken.add(name);

    return name;
  });
};

export const isBlank = (row: Row) => row.every((cell) => String(cell).trim() === '');

export const rowHash = (row: Row) => sha256(JSON.stringify(row), 'base64url').slice(0, 11);

export const rowEvent = (names: string[], row: Row, index: number, version: string) => {
  const rowNumber = index + 2;
  const width = Math.max(names.length, row.length);

  const cells = Array.from({ length: width }, (_, column): [string, z.infer<typeof Cell>] => [
    names[column] ?? columnLetter(column),
    row[column] ?? '',
  ]);

  return {
    id: `${rowNumber}:${version}`,
    payload: { ...Object.fromEntries(cells), rowNumber },
  };
};
