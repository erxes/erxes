import * as z from 'zod';

// One call an extension can make into a host plugin. `name` is its path under
// the host (`deals.get` is `ctx.erxes.sales.deals.get`). `description` is for
// the people and agents choosing a call.
//
// The runtime runs it as one GraphQL root field through the gateway, as the
// caller: a read on Query, a write or destructive call on Mutation. The
// document is generated: `args` declares each argument's GraphQL type, keyed
// by the input field it comes from, and the output schema's fields are the
// selection set.
export type ContractEntry = {
  name: string;
  description: string;
  // destructive: removes or merges records. The install dialog calls these out.
  kind: 'read' | 'write' | 'destructive';
  field: string;
  args: Record<string, string>;
  // The resolver's error for a missing record, which the call answers with
  // null instead.
  notFound?: string;
  input: z.ZodType;
  output: z.ZodType;
};

export type Contract = {
  host: string;
  version: number;
  entries: readonly ContractEntry[];
};

// A host plugin's calls at one version. Pure data: the runtime validates
// input and output against these schemas, and extensions get their types.
export const defineContract = <
  const H extends string,
  const V extends number,
  const E extends readonly ContractEntry[],
>(
  host: H,
  version: V,
  entries: E,
) => ({ host, version, entries });

// Only z.object recurses into a selection set. JSON scalars are typed with
// z.record or z.unknown and selected as leaves.
const selection = (schema: z.ZodType): string => {
  if (
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodDefault
  ) {
    return selection(schema.unwrap() as z.ZodType);
  }

  if (schema instanceof z.ZodArray) {
    return selection(schema.element as z.ZodType);
  }

  if (schema instanceof z.ZodObject) {
    const fields = Object.entries(schema.shape).map(
      ([name, field]) => `${name}${selection(field as z.ZodType)}`,
    );
    return ` { ${fields.join(' ')} }`;
  }

  return '';
};

// The GraphQL document an entry runs: `query ext_sales_deals_get($_id:
// String!) { dealDetail(_id: $_id) { _id name ... } }`. The input, parsed, is
// its variables.
export const toDocument = (host: string, entry: ContractEntry) => {
  const args = Object.entries(entry.args);
  const operation = entry.kind === 'read' ? 'query' : 'mutation';
  const name = `ext_${host}_${entry.name.replaceAll('.', '_')}`;
  const declared = args.length
    ? `(${args.map(([arg, type]) => `$${arg}: ${type}`).join(', ')})`
    : '';
  const passed = args.length
    ? `(${args.map(([arg]) => `${arg}: $${arg}`).join(', ')})`
    : '';

  return `${operation} ${name}${declared} { ${entry.field}${passed}${selection(
    entry.output,
  )} }`;
};

type Call<E extends ContractEntry> = (
  input: z.input<E['input']>,
) => Promise<z.output<E['output']>>;

// `deals.get` becomes { deals: { get: Call } }.
type Nest<N extends string, F> = N extends `${infer Head}.${infer Rest}`
  ? { [K in Head]: Nest<Rest, F> }
  : { [K in N]: F };

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

// What `ctx.erxes.<host>` looks like for one pinned contract.
export type ContractClient<C extends Contract> = UnionToIntersection<
  C['entries'][number] extends infer E
    ? E extends ContractEntry
      ? Nest<E['name'], Call<E>>
      : never
    : never
>;
