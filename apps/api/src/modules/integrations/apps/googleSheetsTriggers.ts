import { z } from 'zod';
import { type OAuthKeys, pollTrigger } from '@erxes/plugin-sdk/integrations';
import {
  readSheet,
  type SheetParams,
  sheetParams,
  spreadsheetLink,
  tabOf,
} from './googleSheetsApi';
import {
  Cell,
  columnLetter,
  columnNames,
  isBlank,
  type Row,
  rowEvent,
  rowHash,
  rowRecord,
} from './googleSheetsRows';

const EVERY_MINUTES = 5;

const MAX_EVENTS_PER_POLL = 200;

const MAX_WATCHED_ROWS = 2000;

const MAX_REMEMBERED_CHARS = 1_000_000;

const PREVIOUS = 'previous_';

const ROW_OUTPUTS = [
  { key: 'rowNumber', label: 'Row number', type: 'number' as const },
  { key: 'rowUrl', label: 'Row link', type: 'text' as const },
  { key: 'sheetName', label: 'Sheet name', type: 'text' as const, recordType: 'sheet' },
  { key: 'spreadsheetName', label: 'Spreadsheet name', type: 'text' as const },
  {
    key: 'spreadsheetId',
    label: 'Spreadsheet id',
    type: 'text' as const,
    recordType: 'spreadsheet',
  },
  { key: 'spreadsheetUrl', label: 'Spreadsheet link', type: 'text' as const },
];

const CHANGE_OUTPUTS = [
  { key: 'changeType', label: 'Added or changed', type: 'text' as const },
  { key: 'changedColumns', label: 'Changed columns', type: 'text' as const },
];

const COLUMNS_NOTE = "Each column arrives under its name in the sheet's first row.";

const PREVIOUS_NOTE = `A changed row also gives each column's value before the change, under ${PREVIOUS} and the column's name.`;

type RowEvent = ReturnType<typeof rowEvent>;

const placed = async (
  keys: OAuthKeys,
  params: SheetParams,
  names: string[],
  events: RowEvent[],
) => {
  if (!events.length) return events;

  const { spreadsheetName, sheetId, sheetName } = await tabOf(keys, params);
  const sheetUrl = spreadsheetLink(params.spreadsheet, sheetId);
  const lastColumn = columnLetter(Math.max(names.length, 1) - 1);

  return events.map(({ id, payload }) => ({
    id,
    payload: {
      ...payload,
      rowUrl: `${sheetUrl}&range=A${payload.rowNumber}:${lastColumn}${payload.rowNumber}`,
      sheetName,
      ...(spreadsheetName && { spreadsheetName }),
      spreadsheetId: params.spreadsheet,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${params.spreadsheet}/edit`,
    },
  }));
};

const Seen = z.object({ rows: z.int().nonnegative() });

export const rowAdded = pollTrigger<OAuthKeys, typeof sheetParams>({
  key: 'row_added',
  label: 'Row added',
  description: `A new row appears at the bottom of the sheet. ${COLUMNS_NOTE}`,
  outputs: ROW_OUTPUTS,
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
      items: await placed(
        keys,
        params,
        names,
        data
          .slice(from, upTo)
          .flatMap((row, offset) =>
            isBlank(row) ? [] : [rowEvent(names, row, from + offset, rowHash(row))],
          ),
      ),
    };
  },
});

const Watched = z.object({
  hashes: z.array(z.string()).max(MAX_WATCHED_ROWS),
  round: z.int().nonnegative(),
  count: z.int().nonnegative().optional(),
  snapshot: z
    .object({ header: z.array(Cell), rows: z.array(z.array(Cell)).max(MAX_WATCHED_ROWS) })
    .optional(),
});

type Watched = z.output<typeof Watched>;

const countsOf = (hashes: string[]) => {
  const counts = new Map<string, number>();

  hashes.forEach((hash) => counts.set(hash, (counts.get(hash) ?? 0) + 1));

  return counts;
};

const remembered = (header: Row, rows: Row[]) => {
  const snapshot = { header, rows };

  return JSON.stringify(snapshot).length <= MAX_REMEMBERED_CHARS ? snapshot : undefined;
};

const watched = (header: Row, data: Row[], hashes: string[], round: number) => ({
  hashes,
  round,
  count: data.length,
  snapshot: remembered(header, data),
});

const differing = (before: Record<string, Row[number]>, after: Record<string, Row[number]>) =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (name) => String(before[name] ?? '') !== String(after[name] ?? ''),
  );

const changeOf = (before: Watched, now: { names: string[]; size: number; hashes: Set<string> }) => {
  const earlier = (index: number) =>
    before.count === now.size ? before.snapshot?.rows[index] : undefined;

  return (row: Row, index: number) => {
    const old = earlier(index);

    if (!old || !before.snapshot || now.hashes.has(rowHash(old)))
      return {
        previous: {},
        fields: before.count !== undefined && index >= before.count ? { changeType: 'added' } : {},
      };

    const previous = rowRecord(columnNames(before.snapshot.header), old);
    const changed = differing(previous, rowRecord(now.names, row));

    return {
      previous: Object.fromEntries(
        Object.entries(previous).map(([name, value]) => [`${PREVIOUS}${name}`, value]),
      ),
      fields: {
        changeType: 'changed',
        ...(changed.length && { changedColumns: changed.join(', ') }),
      },
    };
  };
};

export const rowChanged = pollTrigger<OAuthKeys, typeof sheetParams>({
  key: 'row_added_or_changed',
  label: 'Row added or changed',
  description: `A row is added or a cell in it changes, in the first ${MAX_WATCHED_ROWS.toLocaleString('en')} rows. ${COLUMNS_NOTE} ${PREVIOUS_NOTE}`,
  outputs: [...ROW_OUTPUTS, ...CHANGE_OUTPUTS],
  params: sheetParams,
  everyMinutes: EVERY_MINUTES,
  async poll({ keys, params, cursor }) {
    const { header, data } = await readSheet(keys, params, MAX_WATCHED_ROWS + 1);
    const rows = data.map((row, index) => ({ row, index, hash: rowHash(row) }));
    const before = Watched.safeParse(cursor);

    if (!before.success)
      return {
        cursor: watched(
          header,
          data,
          rows.map((row) => row.hash),
          0,
        ),
        items: [],
      };

    const left = countsOf(before.data.hashes);
    const round = before.data.round + 1;

    const changed = rows.filter(({ row, hash }) => {
      const unchanged = left.get(hash) ?? 0;

      if (unchanged > 0) left.set(hash, unchanged - 1);

      return unchanged === 0 && !isBlank(row);
    });

    const later = new Set(changed.slice(MAX_EVENTS_PER_POLL).map((row) => row.index));
    const names = columnNames(header);

    const change = changeOf(before.data, {
      names,
      size: data.length,
      hashes: new Set(rows.map((row) => row.hash)),
    });

    return {
      cursor: watched(
        header,
        data,
        rows.filter((row) => !later.has(row.index)).map((row) => row.hash),
        round,
      ),
      items: await placed(
        keys,
        params,
        names,
        changed.slice(0, MAX_EVENTS_PER_POLL).map(({ row, index, hash }) => {
          const event = rowEvent(names, row, index, `${hash}:${round}`);
          const { previous, fields } = change(row, index);

          return { id: event.id, payload: { ...previous, ...event.payload, ...fields } };
        }),
      ),
    };
  },
});
