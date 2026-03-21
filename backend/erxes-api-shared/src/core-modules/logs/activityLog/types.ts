export type Change = {
  field: string;
  prev: unknown;
  current: unknown;
  kind?: 'array' | 'value' | 'set' | 'unset' | 'update';
};

export type ResolverParams = {
  field: string;
  prev?: unknown;
  current?: unknown;
  added?: string[];
  removed?: string[];
};

export type Resolver<TResult = any> = (
  params: ResolverParams,
  ctx: any,
) => TResult[] | void | Promise<TResult[] | void>;

export type Config<TResult = any> = {
  assignmentFields?: string[];
  commonFields: string[];
  resolvers: Record<string, Resolver<TResult>>;
};
