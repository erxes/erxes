type OptionalKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : undefined extends T[K] ? K : never;
}[keyof T];

export type GraphqlView<T> = unknown extends T
  ? unknown
  : T extends null | undefined
  ? undefined
  : T extends readonly (infer Item)[]
  ? Exclude<GraphqlView<Item>, undefined>[]
  : T extends object
  ? {
      [K in Exclude<keyof T, OptionalKeys<T>>]: GraphqlView<T[K]>;
    } & {
      [K in OptionalKeys<T>]?: GraphqlView<T[K]>;
    } & ('_id' extends keyof T ? { _id: string } : object)
  : T;

// Forms and selectors use undefined for absent values and never render null rows.
const viewCache = new WeakMap<object, unknown>();
// These extensible scalar payloads are not GraphQL entities or display fields.
const opaqueJsonFields = new Set([
  'extraData',
  'followInfos',
  'followExtras',
  'relAccounts',
  'value',
  'incomeRule',
  'outRule',
  'saleRule',
  'costIncreaseRule',
  'costDecreaseRule',
  'accountingsConfigsByCode',
]);

// Apollo results are immutable; retain identity so effects do not reset on renders.
/* eslint-disable no-redeclare */
export function toGraphqlView<T>(value: T): GraphqlView<T>;
export function toGraphqlView(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'object' && viewCache.has(value)) {
    return viewCache.get(value);
  }
  if (Array.isArray(value)) {
    const result = value
      .map(toGraphqlView)
      .filter((item) => item !== undefined);
    viewCache.set(value, result);
    return result;
  }
  if (typeof value === 'object') {
    if ('_id' in value && (typeof value._id !== 'string' || !value._id)) {
      return undefined;
    }
    const result = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        opaqueJsonFields.has(key) ? item : toGraphqlView(item),
      ]),
    );
    viewCache.set(value, result);
    return result;
  }
  return value;
}
/* eslint-enable no-redeclare */
