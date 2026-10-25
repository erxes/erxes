import { IModels } from '~/connectionResolvers';
import { IConnectionDocument } from '@/connections/@types/connection';
import {
  IConnectionModel,
  loadConnectionClass,
} from '@/connections/db/models/Connections';

type TStored = Record<string, unknown> & { _id: string; name: string };
type TFilter = Record<string, unknown>;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const matches = (doc: TStored, filter: TFilter, caseInsensitive = false) =>
  Object.entries(filter).every(([key, expected]) => {
    const actual = doc[key];

    if (expected && typeof expected === 'object' && '$regex' in expected) {
      const { $regex, $options } = expected as {
        $regex: string;
        $options?: string;
      };

      return new RegExp($regex, $options).test(String(actual));
    }

    if (caseInsensitive && typeof actual === 'string') {
      return actual.toLowerCase() === String(expected).toLowerCase();
    }

    return actual === expected;
  });

/**
 * One tenant's `Connections` collection in memory: the real model statics
 * over a store with the unique, case-insensitive name index. Each call makes
 * an isolated tenant.
 */
export const createMemoryModels = () => {
  const store = new Map<string, TStored>();
  const models = {} as IModels;

  const duplicate = (name: string, exceptId?: string) =>
    [...store.values()].some(
      (doc) => doc._id !== exceptId && doc.name.toLowerCase() === name.toLowerCase(),
    );

  const query = (filter: TFilter) => {
    let caseInsensitive = false;
    const run = async () => {
      const doc = [...store.values()].find((entry) =>
        matches(entry, filter, caseInsensitive),
      );

      return doc ? clone(doc) : null;
    };

    return {
      collation() {
        caseInsensitive = true;
        return run();
      },
      then: (resolve: (value: unknown) => unknown, reject: (e: unknown) => unknown) =>
        run().then(resolve, reject),
    };
  };

  const fake = {
    async create(doc: TStored) {
      if (duplicate(doc.name)) {
        throw Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
      }

      const now = new Date().toISOString();
      const stored = { ...clone(doc), createdAt: now, updatedAt: now };

      store.set(doc._id, stored);

      return clone(stored);
    },
    findOne: query,
    find(filter: TFilter) {
      const docs = [...store.values()]
        .filter((doc) => matches(doc, filter))
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        sort: () => ({ limit: async (count: number) => clone(docs.slice(0, count)) }),
      };
    },
    async findOneAndUpdate(
      filter: TFilter,
      update: { $set?: TFilter; $unset?: Record<string, 1> },
    ) {
      const doc = [...store.values()].find((entry) => matches(entry, filter));

      if (!doc) {
        return null;
      }

      const name = update.$set?.name;

      if (typeof name === 'string' && duplicate(name, doc._id)) {
        throw Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
      }

      Object.assign(doc, clone(update.$set || {}));
      Object.keys(update.$unset || {}).forEach((key) => delete doc[key]);
      doc.updatedAt = new Date().toISOString();

      return clone(doc);
    },
    async deleteOne(filter: TFilter) {
      const doc = [...store.values()].find((entry) => matches(entry, filter));

      if (doc) {
        store.delete(doc._id);
      }

      return { deletedCount: doc ? 1 : 0 };
    },
  };

  const statics = loadConnectionClass(models).statics as unknown as Partial<IConnectionModel>;

  models.Connections = Object.assign(fake, statics) as unknown as IConnectionModel;
  models.Users = {
    findOne: async () => null,
  } as unknown as IModels['Users'];

  return {
    models,
    // Raw stored documents, as they sit at rest.
    raw: () => [...store.values()].map((doc) => clone(doc)) as unknown as IConnectionDocument[],
  };
};
