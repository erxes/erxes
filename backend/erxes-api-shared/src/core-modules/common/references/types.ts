export type TRecordReferenceKind = 'field' | 'relation';

export type TRecordReferencePointer = {
  type: string;
  kind: TRecordReferenceKind;
  path?: string;
  relType?: string;
};

export type TRecordReferenceField = {
  key: string;
  label: string;
  path?: string;
  resolver?: string;
  reference?: TRecordReferencePointer;
};

export type TRecordReferenceType = {
  type: string;
  label: string;
  fields: TRecordReferenceField[];
};

export type TRecordReferenceResolverProps<TModels = any, TTarget = any> = {
  models: TModels;
  target: TTarget;
  subdomain: string;
  type: string;
  path: string;
  field: TRecordReferenceField;
};

export type TRecordReferenceResolver<TModels = any, TTarget = any> = (
  props: TRecordReferenceResolverProps<TModels, TTarget>,
) => any | Promise<any>;

export type TRecordReferenceFetcherProps<TModels = any> = {
  models: TModels;
  subdomain: string;
  type: string;
  id?: string;
  ids: string[];
};

export type TRecordReferenceFetcher<TModels = any, TTarget = any> = (
  props: TRecordReferenceFetcherProps<TModels>,
) => Promise<TTarget | TTarget[] | null>;

export type TRecordReferencesConfig<TModels = any, TTarget = any> = {
  types: TRecordReferenceType[];
  resolvers?: Record<string, TRecordReferenceResolver<TModels, TTarget>>;
  fetchers: Record<string, TRecordReferenceFetcher<TModels, TTarget>>;
  generateModels: (subdomain: string) => Promise<TModels>;
};

export enum TRecordReferenceProducers {
  RESOLVE = 'resolve',
}

export type TRecordReferenceResolveInput = {
  type: string;
  path: string;
  target?: any;
  targetId?: string;
  targetIds?: string[];
  defaultValue?: any;
};

export type TRecordReferenceProducersInput = {
  [TRecordReferenceProducers.RESOLVE]: TRecordReferenceResolveInput;
};
