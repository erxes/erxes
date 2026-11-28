const newId = () => crypto.randomUUID();

export const KINDS = ['text', 'number', 'boolean', 'object', 'list', 'empty'] as const;

export type Kind = (typeof KINDS)[number];

export type JsonNode = {
  id: string;
  key: string;
  kind: Kind;
  text: string;
  on: boolean;
  items: JsonNode[];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const kindOf = (value: unknown): Kind => {
  if (typeof value === 'number') return 'number';

  if (typeof value === 'boolean') return 'boolean';

  if (Array.isArray(value)) return 'list';

  if (isObject(value)) return 'object';

  return value === null ? 'empty' : 'text';
};

export const nodeOf = (value: unknown, key = ''): JsonNode => {
  const kind = kindOf(value);

  const items = Array.isArray(value)
    ? value.map((item) => nodeOf(item))
    : isObject(value)
      ? Object.entries(value).map(([name, item]) => nodeOf(item, name))
      : [];

  return {
    id: newId(),
    key,
    kind,
    text: typeof value === 'string' || typeof value === 'number' ? String(value) : '',
    on: value === true,
    items,
  };
};

export const blank = (kind: Kind, key = ''): JsonNode => ({
  id: newId(),
  key,
  kind,
  text: '',
  on: false,
  items: [],
});

export const valueOf = (node: JsonNode): unknown => {
  switch (node.kind) {
    case 'text':
      return node.text;
    case 'number':
      return Number(node.text) || 0;
    case 'boolean':
      return node.on;
    case 'empty':
      return null;
    case 'list':
      return node.items.map(valueOf);
    case 'object':
      return Object.fromEntries(
        node.items
          .filter((item) => item.key.trim())
          .map((item) => [item.key.trim(), valueOf(item)]),
      );
  }
};

export const repeatedKeys = (node: JsonNode) => {
  const keys = node.items.map((item) => item.key.trim()).filter(Boolean);

  return new Set(keys.filter((key, index) => keys.indexOf(key) !== index));
};

export const withKind = (node: JsonNode, kind: Kind): JsonNode => ({
  ...blank(kind, node.key),
  id: node.id,
  text: kind === 'text' || kind === 'number' ? node.text : '',
});

export const replaceItem = (node: JsonNode, next: JsonNode): JsonNode => ({
  ...node,
  items: node.items.map((item) => (item.id === next.id ? next : item)),
});

export const removeItem = (node: JsonNode, id: string): JsonNode => ({
  ...node,
  items: node.items.filter((item) => item.id !== id),
});

export const isEmptyValue = (value: unknown) =>
  value === undefined ||
  (isObject(value) && Object.keys(value).length === 0) ||
  (Array.isArray(value) && value.length === 0);
