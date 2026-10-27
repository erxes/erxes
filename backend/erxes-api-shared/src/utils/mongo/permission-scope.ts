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

const READ_HOOKS = ['countDocuments', 'distinct', 'find', 'findOne'] as const;

const WRITE_HOOKS = [
  'deleteMany',
  'deleteOne',
  'findOneAndDelete',
  'findOneAndReplace',
  'findOneAndUpdate',
  'replaceOne',
  'updateMany',
  'updateOne',
] as const;

const SYSTEM_OWNER_VALUES = [null, '', []];

const OUT_OF_SCOPE_MESSAGE = 'This record is outside your permission scope';

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

export const withoutPermissionScope = <T>(
  callback: () => T | PromiseLike<T>,
): Promise<T> => {
  const store = permissionScopeStorage.getStore();
  const run = async () => await callback();

  return store
    ? permissionScopeStorage.run({ ...store, bypass: true }, run)
    : run();
};

const getActiveScope = (collectionName?: string) => {
  const scoped = collectionName && scopedCollections.get(collectionName);
  const store = permissionScopeStorage.getStore();

  if (!scoped || !store?.user?._id || store.bypass) {
    return null;
  }

  return { scoped, store };
};

const hasOwner = (
  scoped: IScopedCollection,
  read: (field: string) => unknown,
) =>
  scoped.ownerFields.some((field) => {
    const value = read(field);
    return Array.isArray(value) ? value.length > 0 : !!value;
  });

const ownerValue = (schema: Schema, field: string, userId: string) =>
  schema.path(field)?.instance === 'Array' ? [userId] : userId;

const stampOwner = (
  schema: Schema,
  scoped: IScopedCollection,
  userId: string,
  read: (field: string) => unknown,
  write: (field: string, value: unknown) => void,
) => {
  if (hasOwner(scoped, read)) {
    return;
  }

  const field = scoped.ownerFields.find((name) => schema.path(name));

  if (field) {
    write(field, ownerValue(schema, field, userId));
  }
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

  if (scoped.ownerFields.length) {
    conditions.push({
      $and: scoped.ownerFields.map((field) => ({
        [field]: { $in: SYSTEM_OWNER_VALUES },
      })),
    });
  }

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
  schema.pre([...READ_HOOKS], async function (this: Query<unknown, unknown>) {
    const filter = await getPermissionScopeFilter(
      this.model?.collection?.collectionName,
    );

    if (filter) {
      this.and([filter]);
    }
  });

  schema.pre(
    [...WRITE_HOOKS],
    { document: false, query: true },
    async function (this: Query<unknown, unknown>) {
      const filter = await getPermissionScopeFilter(
        this.model?.collection?.collectionName,
      );

      if (!filter) {
        return;
      }

      const conditions = this.getFilter();
      const [total, allowed] = await withoutPermissionScope(() =>
        Promise.all([
          this.model.countDocuments(conditions),
          this.model.countDocuments({ $and: [conditions, filter] }),
        ]),
      );

      if (total > allowed) {
        throw new Error(OUT_OF_SCOPE_MESSAGE);
      }

      this.and([filter]);
    },
  );

  schema.pre('save', function () {
    if (!this.isNew) {
      return;
    }

    const active = getActiveScope(this.collection?.collectionName);

    if (active) {
      stampOwner(
        schema,
        active.scoped,
        active.store.user._id,
        (field) => this.get(field),
        (field, value) => this.set(field, value),
      );
    }
  });

  schema.pre('insertMany', function (next, docs: Record<string, unknown>[]) {
    const active = getActiveScope(this.collection?.collectionName);

    if (active) {
      for (const doc of Array.isArray(docs) ? docs : [docs]) {
        stampOwner(
          schema,
          active.scoped,
          active.store.user._id,
          (field) => doc[field],
          (field, value) => {
            doc[field] = value;
          },
        );
      }
    }

    next();
  });

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
