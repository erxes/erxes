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
  actions: string[];
  bypass?: boolean;
}

export interface IPermissionScopeResolution {
  all: boolean;
  userIds: string[];
  entityIds: string[];
  primaryEntityId?: string;
}

interface IScopedCollection {
  plugin: string;
  module: string;
  ownerFields: string[];
  entityField?: string;
  actions: string[];
}

type TPermissionScopeResolver = (
  store: IPermissionScopeStore,
  plugin: string,
  module: string,
  actions: string[],
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
        entityField: module.entityField,
        actions: (module.actions || []).map((action) => action.name),
      });
    }
  }
};

export const runWithPermissionScope = <T>(
  store: IPermissionScopeStore,
  callback: () => T,
) => permissionScopeStorage.run(store, callback);

export const runAsPermissionScopeUser = <T>(
  subdomain: string,
  userId: string | undefined,
  callback: () => Promise<T>,
): Promise<T> =>
  userId
    ? permissionScopeStorage.run(
        { subdomain, user: { _id: userId }, cache: new Map(), actions: [] },
        callback,
      )
    : callback();

export const withoutPermissionScope = <T>(
  callback: () => T | PromiseLike<T>,
): Promise<T> => {
  const store = permissionScopeStorage.getStore();
  const run = async () => await callback();

  return store
    ? permissionScopeStorage.run({ ...store, bypass: true }, run)
    : run();
};

export const recordPermissionAction = (action: string) => {
  const store = permissionScopeStorage.getStore();

  if (store && !store.actions.includes(action)) {
    store.actions.push(action);
  }
};

const getActiveScope = (collectionName?: string) => {
  const scoped = collectionName && scopedCollections.get(collectionName);
  const store = permissionScopeStorage.getStore();

  if (
    !scoped ||
    !permissionScopeResolver ||
    !store?.user?._id ||
    store.bypass
  ) {
    return null;
  }

  return { scoped, store };
};

const resolveScope = async (
  scoped: IScopedCollection,
  store: IPermissionScopeStore,
): Promise<IPermissionScopeResolution | undefined> => {
  const actions = store.actions
    .filter((action) => scoped.actions.includes(action))
    .sort((a, b) => a.localeCompare(b));
  const key = `${scoped.plugin}:${scoped.module}:${actions.join(',')}`;
  let pending = store.cache.get(key);

  if (!pending && permissionScopeResolver) {
    pending = permissionScopeResolver(
      store,
      scoped.plugin,
      scoped.module,
      actions,
    );
    store.cache.set(key, pending);
  }

  return pending;
};

const isEmptyValue = (value: unknown) =>
  Array.isArray(value) ? value.length === 0 : !value;

const fieldValue = (schema: Schema, field: string, id: string) =>
  schema.path(field)?.instance === 'Array' ? [id] : id;

const stampDefaults = (
  schema: Schema,
  scoped: IScopedCollection,
  userId: string,
  resolution: IPermissionScopeResolution | undefined,
  read: (field: string) => unknown,
  write: (field: string, value: unknown) => void,
) => {
  if (scoped.ownerFields.every((field) => isEmptyValue(read(field)))) {
    const field = scoped.ownerFields.find((name) => schema.path(name));

    if (field) {
      write(field, fieldValue(schema, field, userId));
    }
  }

  const { entityField } = scoped;
  const primaryEntityId = resolution?.primaryEntityId;

  if (
    entityField &&
    primaryEntityId &&
    schema.path(entityField) &&
    isEmptyValue(read(entityField))
  ) {
    write(entityField, fieldValue(schema, entityField, primaryEntityId));
  }
};

export const getPermissionScopeFilter = async (
  collectionName?: string,
): Promise<FilterQuery<unknown> | null> => {
  const active = getActiveScope(collectionName);

  if (!active || active.store.user.isOwner) {
    return null;
  }

  const { scoped, store } = active;
  const resolution = await resolveScope(scoped, store);

  if (!resolution || resolution.all) {
    return null;
  }

  const conditions: FilterQuery<unknown>[] = scoped.ownerFields.map(
    (field) => ({ [field]: { $in: resolution.userIds } }),
  );

  if (scoped.entityField && resolution.entityIds.length) {
    conditions.push({ [scoped.entityField]: { $in: resolution.entityIds } });
  }

  if (scoped.ownerFields.length) {
    const unassignedFields = scoped.entityField
      ? [...scoped.ownerFields, scoped.entityField]
      : scoped.ownerFields;

    conditions.push({
      $and: unassignedFields.map((field) => ({
        [field]: { $in: SYSTEM_OWNER_VALUES },
      })),
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

  schema.pre('save', async function () {
    if (!this.isNew) {
      return;
    }

    const active = getActiveScope(this.collection?.collectionName);

    if (!active) {
      return;
    }

    const resolution = await resolveScope(active.scoped, active.store);

    stampDefaults(
      schema,
      active.scoped,
      active.store.user._id,
      resolution,
      (field) => this.get(field),
      (field, value) => this.set(field, value),
    );
  });

  schema.pre('insertMany', function (next, docs: Record<string, unknown>[]) {
    const active = getActiveScope(this.collection?.collectionName);

    if (!active) {
      return next();
    }

    resolveScope(active.scoped, active.store)
      .then((resolution) => {
        for (const doc of Array.isArray(docs) ? docs : [docs]) {
          stampDefaults(
            schema,
            active.scoped,
            active.store.user._id,
            resolution,
            (field) => doc[field],
            (field, value) => {
              doc[field] = value;
            },
          );
        }

        next();
      })
      .catch(next);
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
