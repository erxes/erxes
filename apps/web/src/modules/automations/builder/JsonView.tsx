import {
  IconBraces,
  IconHash,
  IconLetterCase,
  IconList,
  IconToggleRight,
} from '@tabler/icons-react';
import { PanelField } from 'erxes-ui';
import { z } from 'zod';

type Row = { label: string; value: unknown };

const Json = z.record(z.string(), z.unknown());

const List = z.array(z.unknown());

const rowsOf = (value: unknown, prefix = ''): Row[] => {
  const object = Json.safeParse(value).data;

  if (object && !Array.isArray(value))
    return Object.entries(object).flatMap(([key, item]) =>
      rowsOf(item, prefix ? `${prefix} › ${key}` : key),
    );

  return [{ label: prefix, value }];
};

const iconOf = (value: unknown) => {
  if (typeof value === 'number') return IconHash;

  if (typeof value === 'boolean') return IconToggleRight;

  if (List.safeParse(value).success) return IconList;

  return typeof value === 'string' ? IconLetterCase : IconBraces;
};

const textOf = (value: unknown): string => {
  if (value === null || value === undefined) return '—';

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (typeof value === 'string' || typeof value === 'number') return String(value);

  const list = List.safeParse(value).data;

  return list ? list.map(textOf).join(', ') : JSON.stringify(value);
};

export const JsonView = ({ value }: { value: unknown }) => {
  const rows = rowsOf(value);

  if (rows.length === 1 && !rows[0]?.label) return <span className="text-xs">{textOf(value)}</span>;

  return (
    <div>
      {rows.map((row) => (
        <PanelField key={row.label} label={row.label} icon={iconOf(row.value)} cell={false}>
          <span className="block truncate text-xs" title={textOf(row.value)}>
            {textOf(row.value)}
          </span>
        </PanelField>
      ))}
    </div>
  );
};
