import type * as z from 'zod';

// One call an extension can make into a host plugin. `name` is its path under
// the host (`deals.get` is `ctx.erxes.sales.deals.get`). `description` is for
// the people and agents choosing a call. Only reads exist so far.
export type ContractEntry = {
  name: string;
  description: string;
  kind: 'read';
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
