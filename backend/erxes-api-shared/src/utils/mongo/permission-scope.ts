import { AsyncLocalStorage } from 'async_hooks';
import { Aggregate, FilterQuery, Query, Schema } from 'mongoose';
import { IPermissionConfig } from '../../core-types/modules/permissions/permission';

export interface IPermissionScopeUser {
  _id: string;
  isOwner?: boolean;
}

export interface IPermissionScopeStore {
  subdomain: string;
  user: IPermissionScopeUser;
  cache: Map<string, Promise<IPermissionScopeResolution>>;
  bypass?: boolean;
}

export interface IPermissionScopeResolution {
  all: boolean;
  userIds: string[];
  branchIds: string[];
  departmentIds: string[];
}

interface IScopedCollection {
  plugin: string;
  module: string;
  ownerFields: string[];
  branchField?: string;
  departmentField?: string;
}

type TPermissionScopeResolver = (
  store: IPermissionScopeStore,
  plugin: string,
  module: string,
) => Promise<IPermissionScopeResolution>;

const QUERY_HOOKS = [
  'countDocuments',
  'deleteMany',
  'deleteOne',
  'distinct',
  'find',
  'findOne',
  'findOneAndDelete',
  'findOneAndReplace',
  'findOneAndUpdate',
  'replaceOne',
  'updateMany',
  'updateOne',
] as const;

const LEADING_STAGES = ['$geoNear', '$search', '$searchMeta', '$vectorSearch'];

const permissionScopeStorage = new AsyncLocalStorage<IPermissionScopeStore>();
const scopedCollections = new Map<string, IScopedCollection>();
let permissionScopeResolver: TPermissionScopeResolver | null = null;

export const setPermissionScopeResolver = (
  resolver: TPermissionScopeResolver,
) => {
  permissionScopeResolver = resolver;
};

export const registerPermissionScopes = (
  plugin: string,
  config?: IPermissionConfig,
) => {
  for (const module of config?.modules || []) {
    for (const collection of module.scopeCollections || []) {
      scopedCollections.set(collection, {
        plugin,
        module: module.name,
        ownerFields: module.ownerFields || [],
        branchField: module.branchField,
        departmentField: module.departmentField,
      });
    }
  }
};

export const runWithPermissionScope = <T>(
  store: IPermissionScopeStore,
  callback: () => T,
) => permissionScopeStorage.run(store, callback);

export const withoutPermissionScope = <T>(callback: () => T) => {
  const store = permissionScopeStorage.getStore();

  return store
    ? permissionScopeStorage.run({ ...store, bypass: true }, callback)
    : callback();
};

export const getPermissionScopeFilter = async (
  collectionName?: string,
): Promise<FilterQuery<unknown> | null> => {
  const scoped = collectionName && scopedCollections.get(collectionName);
  const store = permissionScopeStorage.getStore();

  if (
    !scoped ||
    !permissionScopeResolver ||
    !store?.user?._id ||
    store.bypass ||
    store.user.isOwner
  ) {
    return null;
  }

  const key = `${scoped.plugin}:${scoped.module}`;
  let pending = store.cache.get(key);

  if (!pending) {
    pending = permissionScopeResolver(store, scoped.plugin, scoped.module);
    store.cache.set(key, pending);
  }

  const resolution = await pending;

  if (resolution.all) {
    return null;
  }

  const conditions: FilterQuery<unknown>[] = scoped.ownerFields.map(
    (field) => ({ [field]: { $in: resolution.userIds } }),
  );

  if (scoped.branchField && resolution.branchIds.length) {
    conditions.push({ [scoped.branchField]: { $in: resolution.branchIds } });
  }

  if (scoped.departmentField && resolution.departmentIds.length) {
    conditions.push({
      [scoped.departmentField]: { $in: resolution.departmentIds },
    });
  }

  return conditions.length ? { $or: conditions } : { _id: { $in: [] } };
};

export const applyPermissionScopeHooks = (schema: Schema) => {
  schema.pre(
    [...QUERY_HOOKS],
    { document: false, query: true },
    async function (this: Query<unknown, unknown>) {
      const filter = await getPermissionScopeFilter(
        this.model?.collection?.collectionName,
      );

      if (filter) {
        this.and([filter]);
      }
    },
  );

  schema.pre('aggregate', async function (this: Aggregate<unknown>) {
    const filter = await getPermissionScopeFilter(
      this.model()?.collection?.collectionName,
    );

    if (!filter) {
      return;
    }

    const pipeline = this.pipeline();
    const [firstStage] = pipeline;
    const index =
      firstStage && LEADING_STAGES.some((stage) => stage in firstStage) ? 1 : 0;

    pipeline.splice(index, 0, { $match: filter });
  });
};
