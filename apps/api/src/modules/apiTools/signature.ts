import { z } from 'zod';

/** The parts of a JSON schema a signature shows; anything else in it is ignored. */
const Node = z.looseObject({
  type: z.union([z.string(), z.array(z.string())]).optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  additionalProperties: z.unknown().optional(),
  required: z.array(z.string()).optional(),
  items: z.unknown().optional(),
  enum: z.array(z.unknown()).optional(),
  const: z.unknown().optional(),
  anyOf: z.array(z.unknown()).optional(),
  oneOf: z.array(z.unknown()).optional(),
  allOf: z.array(z.unknown()).optional(),
  description: z.string().optional(),
  maximum: z.number().optional(),
});

type Node = z.infer<typeof Node>;

/** Objects nested deeper than this show as `object`. */
const MAX_DEPTH = 4;

/** Enums longer than this show their first values and `…`. */
const MAX_ENUM = 12;

/** Field descriptions on the first two levels come along, cut to this length. */
const MAX_NOTE = 400;

const literal = (value: unknown) => JSON.stringify(value) ?? 'null';

const union = (parts: string[]) => [...new Set(parts)].join(' | ') || 'unknown';

const scalar = (type: string, node: Node) => {
  if (type === 'integer') return node.maximum === undefined ? 'int' : `int ≤${node.maximum}`;

  return type === 'null' ? 'null' : type;
};

const note = (node: Node, depth: number) =>
  node.description && depth < 2
    ? ` /* ${node.description.replaceAll('*/', '* /').slice(0, MAX_NOTE)} */`
    : '';

function objectOf(node: Node, depth: number): string {
  const properties = Object.entries(node.properties ?? {});

  if (properties.length === 0) {
    const values = node.additionalProperties;

    return values && typeof values === 'object'
      ? `Record<string, ${render(values, depth + 1)}>`
      : 'object';
  }

  if (depth >= MAX_DEPTH) return 'object';

  const required = new Set(node.required ?? []);

  const fields = properties.map(([name, value]) => {
    const parsed = Node.safeParse(value);
    const optional = required.has(name) ? '' : '?';
    const comment = parsed.success ? note(parsed.data, depth) : '';

    return `${name}${optional}: ${render(value, depth + 1)}${comment}`;
  });

  return `{ ${fields.join('; ')} }`;
}

const arrayOf = (node: Node, depth: number) => {
  const item = render(node.items ?? {}, depth);

  return item.includes(' | ') ? `(${item})[]` : `${item}[]`;
};

const typed = (type: string, node: Node, depth: number) => {
  if (type === 'object') return objectOf(node, depth);

  return type === 'array' ? arrayOf(node, depth) : scalar(type, node);
};

/** One schema node as a TypeScript-like type. */
function render(schema: unknown, depth: number): string {
  const parsed = Node.safeParse(schema);

  if (!parsed.success) return 'unknown';

  const node = parsed.data;

  if (node.const !== undefined) return literal(node.const);

  if (node.enum) {
    const shown = node.enum.slice(0, MAX_ENUM).map(literal);

    return union(node.enum.length > MAX_ENUM ? [...shown, '…'] : shown);
  }

  const options = node.anyOf ?? node.oneOf;

  if (options) return union(options.map((option) => render(option, depth)));

  if (node.allOf) return node.allOf.map((part) => render(part, depth)).join(' & ');

  if (Array.isArray(node.type)) return union(node.type.map((type) => typed(type, node, depth)));

  if (node.type) return typed(node.type, node, depth);

  return node.properties ? objectOf(node, depth) : 'unknown';
}

/**
 * A procedure's input as one line of TypeScript-like type: what an agent needs to call it, in a
 * fraction of the JSON schema's tokens. Field descriptions on the first levels come along.
 */
export const signatureOf = (schema: unknown) => render(schema, 0);
