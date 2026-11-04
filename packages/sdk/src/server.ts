// Type-only: the driver never reaches the worker bundle.
import type {
  AggregateOptions,
  BulkWriteOptions,
  BulkWriteResult,
  CountDocumentsOptions,
  DeleteManyModel,
  DeleteOneModel,
  DeleteOptions,
  DeleteResult,
  DistinctOptions,
  Document,
  Filter,
  FindOneAndDeleteOptions,
  FindOneAndReplaceOptions,
  FindOneAndUpdateOptions,
  FindOptions,
  Flatten,
  InsertManyResult,
  InsertOneResult,
  ReplaceOneModel,
  ReplaceOptions,
  UpdateFilter,
  UpdateManyModel,
  UpdateOneModel,
  UpdateOptions,
  UpdateResult,
} from 'mongodb';

export { ExtensionError } from './errors';

// A document as the extension reads it: its own fields plus the string `_id`
// and timestamps the host adds on every insert and update. Values travel as
// JSON, so dates arrive as ISO strings.
export type Stored<T> = T & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// The options each method accepts. Anything else (session, writeConcern,
// maxTimeMS, allowDiskUse) is the host's to set.
type Sorting = 'sort' | 'projection' | 'hint' | 'collation';

type Update<T> = UpdateFilter<Stored<T>> | Document[];

// One bulkWrite operation. Inserts and replacements take the extension's
// own fields; the host adds `_id` and the timestamps.
export type BulkWriteOperation<T extends Document> =
  | { insertOne: { document: T } }
  | {
      replaceOne: Omit<ReplaceOneModel<Stored<T>>, 'replacement' | 'sort'> & {
        replacement: T;
      };
    }
  | { updateOne: Omit<UpdateOneModel<Stored<T>>, 'sort'> }
  | { updateMany: UpdateManyModel<Stored<T>> }
  | { deleteOne: DeleteOneModel<Stored<T>> }
  | { deleteMany: DeleteManyModel<Stored<T>> };

// The mongodb driver's Collection, as `ctx.db.<Name>`. Cursor methods (find,
// aggregate) resolve to arrays. No sessions, so no transactions.
export type ExtensionCollection<T extends Document> = {
  find(
    filter?: Filter<Stored<T>>,
    options?: Pick<FindOptions, Sorting | 'skip' | 'limit'>,
  ): Promise<Stored<T>[]>;
  findOne(
    filter?: Filter<Stored<T>>,
    options?: Pick<FindOptions, Sorting | 'skip'>,
  ): Promise<Stored<T> | null>;
  countDocuments(
    filter?: Filter<Stored<T>>,
    options?: Pick<
      CountDocumentsOptions,
      'skip' | 'limit' | 'hint' | 'collation'
    >,
  ): Promise<number>;
  estimatedDocumentCount(): Promise<number>;
  distinct<K extends keyof Stored<T> & string>(
    key: K,
    filter?: Filter<Stored<T>>,
    options?: Pick<DistinctOptions, 'collation'>,
  ): Promise<Flatten<Stored<T>[K]>[]>;
  insertOne(doc: T): Promise<InsertOneResult<Stored<T>>>;
  insertMany(
    docs: T[],
    options?: Pick<BulkWriteOptions, 'ordered'>,
  ): Promise<InsertManyResult<Stored<T>>>;
  updateOne(
    filter: Filter<Stored<T>>,
    update: Update<T>,
    options?: Pick<
      UpdateOptions,
      'upsert' | 'arrayFilters' | 'hint' | 'collation'
    >,
  ): Promise<UpdateResult<Stored<T>>>;
  updateMany(
    filter: Filter<Stored<T>>,
    update: Update<T>,
    options?: Pick<
      UpdateOptions,
      'upsert' | 'arrayFilters' | 'hint' | 'collation'
    >,
  ): Promise<UpdateResult<Stored<T>>>;
  replaceOne(
    filter: Filter<Stored<T>>,
    replacement: T,
    options?: Pick<ReplaceOptions, 'upsert' | 'hint' | 'collation'>,
  ): Promise<UpdateResult<Stored<T>>>;
  deleteOne(
    filter?: Filter<Stored<T>>,
    options?: Pick<DeleteOptions, 'hint' | 'collation'>,
  ): Promise<DeleteResult>;
  deleteMany(
    filter?: Filter<Stored<T>>,
    options?: Pick<DeleteOptions, 'hint' | 'collation'>,
  ): Promise<DeleteResult>;
  findOneAndUpdate(
    filter: Filter<Stored<T>>,
    update: Update<T>,
    options?: Pick<
      FindOneAndUpdateOptions,
      Sorting | 'upsert' | 'arrayFilters' | 'returnDocument'
    >,
  ): Promise<Stored<T> | null>;
  findOneAndReplace(
    filter: Filter<Stored<T>>,
    replacement: T,
    options?: Pick<
      FindOneAndReplaceOptions,
      Sorting | 'upsert' | 'returnDocument'
    >,
  ): Promise<Stored<T> | null>;
  findOneAndDelete(
    filter: Filter<Stored<T>>,
    options?: Pick<FindOneAndDeleteOptions, Sorting>,
  ): Promise<Stored<T> | null>;
  bulkWrite(
    operations: BulkWriteOperation<T>[],
    options?: Pick<BulkWriteOptions, 'ordered'>,
  ): Promise<
    Pick<
      BulkWriteResult,
      | 'insertedCount'
      | 'matchedCount'
      | 'modifiedCount'
      | 'deletedCount'
      | 'upsertedCount'
      | 'insertedIds'
      | 'upsertedIds'
    >
  >;
  aggregate<R extends Document = Document>(
    pipeline: Document[],
    options?: Pick<AggregateOptions, 'hint' | 'collation' | 'let'>,
  ): Promise<R[]>;
};

// A collection the extension owns, typed by its document. Stored per tenant
// as `ext.<id>.<Name>`, named in PascalCase like a plugin's models:
//
//   collections: { ResponseTemplates: collection<IResponseTemplate>() }
export type CollectionDefinition<T extends Document = Document> = {
  readonly __document?: T;
};

export const collection = <
  T extends Document,
>(): CollectionDefinition<T> => ({});

type DocumentOf<C> = C extends CollectionDefinition<infer T> ? T : never;

// Indexes on the extension's own collections, built when a version is
// activated. Keys are top-level fields, ascending (1) or descending (-1). A
// unique index makes a write that would duplicate its keys fail with CONFLICT.
// A sparse one skips documents without the field.
export type Index<T> = {
  keys: { [F in keyof Stored<T> & string]?: 1 | -1 };
  unique?: boolean;
  sparse?: boolean;
};

// Permission actions by module, each with the title shown in Settings >
// Permissions. They join core's permission groups like a plugin's.
export type Permissions = Record<string, Record<string, string>>;

// `module.action`, from the extension's permissions.
export type PermissionKey<P> = {
  [M in keyof P & string]: `${M}.${keyof P[M] & string}`;
}[keyof P & string];

// A GraphQL operation from the extension's codegen of server/operations
// (persisted documents). The types come from codegen; at runtime only the
// hash crosses into the runtime, which runs the document the install shipped
// under that hash.
export type Operation<R, V> = {
  __apiType?: (variables: V) => R;
  __meta__?: Record<string, unknown>;
};

// What every resolver receives as its third argument, typed by the
// extension's collections. Everything runs as `user`, who passed the root
// field's permission check. Resolvers can't take it from `typeof extension`:
// their inferred return types would feed the type they are part of.
//
//   export type IContext = Context<typeof collections>;
export type Context<C extends Record<string, CollectionDefinition>> = {
  user: { _id: string };
  db: { [K in keyof C]: ExtensionCollection<DocumentOf<C[K]>> };
  // One of the extension's persisted operations, run through the gateway as
  // `user`. A resolver's error throws GRAPHQL with its message; a refusal
  // throws UNAUTHENTICATED or FORBIDDEN.
  gql<R, V>(
    operation: Operation<R, V>,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    ...variables: {} extends V ? [V?] : [V]
  ): Promise<R>;
};

// Root fields only: each one runs in the sandbox as one call, and every
// nested field resolves from the JSON it returns.
export type RootResolvers = {
  Query?: object;
  Mutation?: object;
};

type RootFields<R extends RootResolvers> =
  keyof NonNullable<R['Query']> | keyof NonNullable<R['Mutation']>;

// An extension's whole server: its GraphQL schema as SDL strings (like a
// plugin's `types`, `queries` and `mutations`), the resolvers of its root
// fields, its collections and their indexes, its permissions, and the
// permission each root field needs ('public' is any signed-in user).
export const defineExtension = <
  C extends Record<string, CollectionDefinition>,
  P extends Permissions,
  R extends RootResolvers,
>(definition: {
  types?: string;
  queries?: string;
  mutations?: string;
  resolvers: R;
  collections: C;
  indexes?: { [K in keyof C]?: Index<DocumentOf<C[K]>>[] };
  permissions: P;
  fieldPermissions: { [F in RootFields<R>]: PermissionKey<P> | 'public' };
}) => definition;

// What the CLI and the worker read from `extension`, whatever its types.
export type AnyExtension = {
  types?: string;
  queries?: string;
  mutations?: string;
  resolvers: Record<string, Record<string, unknown> | undefined>;
  collections: Record<string, CollectionDefinition>;
  indexes?: Record<
    string,
    | { keys: Record<string, 1 | -1>; unique?: boolean; sparse?: boolean }[]
    | undefined
  >;
  permissions: Permissions;
  fieldPermissions: Record<string, string>;
};
