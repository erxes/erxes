import { z } from 'zod';
import { defineIntegration, type OAuthKeys, oauthKeys, pollTrigger } from '../define';
import {
  accountOf,
  columnNames,
  isBlank,
  readSheet,
  rowEvent,
  rowHash,
  sheetParams,
} from './googleSheetsApi';

const EVERY_MINUTES = 5;

const MAX_EVENTS_PER_POLL = 200;

const MAX_WATCHED_ROWS = 2000;

const OUTPUTS = [{ key: 'rowNumber', label: 'Row number', type: 'number' as const }];

const COLUMNS_NOTE = "Each column arrives under its name in the sheet's first row.";

const Seen = z.object({ rows: z.int().nonnegative() });

const Hashes = z.object({ hashes: z.array(z.string()).max(MAX_WATCHED_ROWS) });

const rowAdded = pollTrigger<OAuthKeys, typeof sheetParams>({
  key: 'row_added',
  label: 'Row added',
  description: `A new row appears at the bottom of the sheet. ${COLUMNS_NOTE}`,
  outputs: OUTPUTS,
  params: sheetParams,
  everyMinutes: EVERY_MINUTES,
  async poll({ keys, params, cursor }) {
    const { header, data } = await readSheet(keys, params);
    const seen = Seen.safeParse(cursor);

    if (!seen.success) return { cursor: { rows: data.length }, items: [] };

    const from = Math.min(seen.data.rows, data.length);
    const upTo = Math.min(data.length, from + MAX_EVENTS_PER_POLL);
    const names = columnNames(header);

    return {
      cursor: { rows: upTo },
      items: data
        .slice(from, upTo)
        .flatMap((row, offset) => (isBlank(row) ? [] : [rowEvent(names, row, from + offset)])),
    };
  },
});

const unchangedCounts = (hashes: string[]) => {
  const counts = new Map<string, number>();

  hashes.forEach((hash) => counts.set(hash, (counts.get(hash) ?? 0) + 1));

  return counts;
};

const rowChanged = pollTrigger<OAuthKeys, typeof sheetParams>({
  key: 'row_added_or_changed',
  label: 'Row added or changed',
  description: `A row is added or a cell in it changes, in the first ${MAX_WATCHED_ROWS.toLocaleString('en')} rows. ${COLUMNS_NOTE}`,
  outputs: OUTPUTS,
  params: sheetParams,
  everyMinutes: EVERY_MINUTES,
  async poll({ keys, params, cursor }) {
    const { header, data } = await readSheet(keys, params, MAX_WATCHED_ROWS + 1);
    const rows = data.map((row, index) => ({ row, index, hash: rowHash(row) }));
    const before = Hashes.safeParse(cursor);

    if (!before.success) return { cursor: { hashes: rows.map((row) => row.hash) }, items: [] };

    const left = unchangedCounts(before.data.hashes);

    const changed = rows.filter(({ row, hash }) => {
      const unchanged = left.get(hash) ?? 0;

      if (unchanged > 0) left.set(hash, unchanged - 1);

      return unchanged === 0 && !isBlank(row);
    });

    const later = new Set(changed.slice(MAX_EVENTS_PER_POLL).map((row) => row.index));
    const names = columnNames(header);

    return {
      cursor: { hashes: rows.filter((row) => !later.has(row.index)).map((row) => row.hash) },
      items: changed
        .slice(0, MAX_EVENTS_PER_POLL)
        .map(({ row, index }) => rowEvent(names, row, index)),
    };
  },
});

export const googleSheets = defineIntegration({
  key: 'googlesheets',
  name: 'Google Sheets',
  summary: 'Start automations when rows are added to or changed in a Google Sheets spreadsheet.',
  category: 'productivity',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://console.cloud.google.com/apis/credentials',
  keys: oauthKeys,
  oauth: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['openid', 'email', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
    authorizeParams: { access_type: 'offline', prompt: 'consent' },
    account: (accessToken) => accountOf(accessToken),
  },
  async verify(keys, options) {
    await accountOf(keys.accessToken, options);
  },
  triggers: [rowAdded, rowChanged],
});
