export const textOf = (value: unknown) => {
  if (typeof value === 'string') return value;

  return typeof value === 'number' ? String(value) : '';
};

export const optionalText = (value: unknown) => textOf(value) || undefined;

export const listOf = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];

const PICKED_KINDS = ['customer', 'company', 'product', 'tag', 'member'] as const;

export type PickedKind = (typeof PICKED_KINDS)[number];

const PICKED = /^(.*?)\s*\((customer|company|product|tag|member) id ([\w-]+)\)$/;

const isPickedKind = (kind: string | undefined): kind is PickedKind =>
  PICKED_KINDS.some((known) => known === kind);

export const pickedRecord = (entry: string) => {
  const [, name = '', kind, id] = PICKED.exec(entry) ?? [];

  return isPickedKind(kind) && id ? { name, kind, id } : null;
};

export const pickedEntry = (kind: PickedKind, id: string, name: string | undefined) =>
  name ? `${name} (${kind} id ${id})` : `(${kind} id ${id})`;
