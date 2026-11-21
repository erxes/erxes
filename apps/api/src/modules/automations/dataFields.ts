import { DataField } from '@erxes/core-contract';

type CarriedKind = 'text' | 'number' | 'boolean' | 'list';

export type Carried = { key: string; kind: CarriedKind };

const FITS: Record<CarriedKind, readonly DataField['type'][]> = {
  text: ['text', 'date', 'member', 'select'],
  number: ['number', 'text'],
  boolean: ['boolean', 'text'],
  list: ['list', 'tags'],
};

const widened = (kind: CarriedKind): CarriedKind => (kind === 'list' ? 'list' : 'text');

const kindOf = (value: unknown): CarriedKind | null => {
  if (typeof value === 'string') return 'text';

  if (typeof value === 'number') return 'number';

  if (typeof value === 'boolean') return 'boolean';

  return Array.isArray(value) ? 'list' : null;
};

export const labelOf = (key: string) => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll(/[_.]/g, ' ')
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const carriedBy = (data: Record<string, unknown>): Carried[] =>
  Object.entries(data).flatMap(([key, value]) => {
    const kind = DataField.shape.key.safeParse(key).success ? kindOf(value) : null;

    return kind ? [{ key, kind }] : [];
  });

export const healedFields = (declared: DataField[], carried: Carried[]): DataField[] => {
  const kinds = new Map(carried.map(({ key, kind }) => [key, kind]));

  const corrected = declared.map((field) => {
    const kind = kinds.get(field.key);

    return kind && !FITS[kind].includes(field.type) ? { ...field, type: widened(kind) } : field;
  });

  const listed = new Set(declared.map((field) => field.key));

  const added = carried
    .filter(({ key }) => !listed.has(key))
    .map(({ key, kind }) => ({ key, label: labelOf(key), type: kind }));

  return [...corrected, ...added];
};
