import { FilterQuery, Model, Schema } from 'mongoose';
import { CONTACT_FIELD_BY_KIND } from './constants';
import { IContactFields, TContactFieldsSync } from './types';

/**
 * Whether a record's contact fields can be trusted. Both are set (to an id or
 * `null`) once the record is migrated or created after the fields existed;
 * before that, its contacts are still read from `relations`.
 */
export const hasContactFields = (
  doc?: IContactFields | null,
): doc is Required<IContactFields> =>
  !!doc && doc.customerId !== undefined && doc.companyId !== undefined;

const READY_RECHECK_MS = 60 * 1000;
const readiness = new Map<string, { ready: boolean; checkedAt: number }>();

// Any model whose records keep contact fields.
interface IContactFieldsExists {
  exists(filter: FilterQuery<IContactFields>): PromiseLike<unknown>;
}

/**
 * Whether every record in a collection has its contact fields, so queries
 * may filter on them. Once true it stays true (new records always get the
 * fields); until then it is rechecked at most once a minute.
 */
export const contactFieldsReady = async (
  model: IContactFieldsExists,
  cacheKey: string,
) => {
  const cached = readiness.get(cacheKey);

  if (
    cached &&
    (cached.ready || Date.now() - cached.checkedAt < READY_RECHECK_MS)
  ) {
    return cached.ready;
  }

  const missing = await model.exists({
    $or: [
      { customerId: { $exists: false } },
      { companyId: { $exists: false } },
    ],
  });
  const ready = !missing;

  readiness.set(cacheKey, { ready, checkedAt: Date.now() });

  return ready;
};

type TContactFieldsModel = Pick<Model<IContactFields>, 'updateMany'>;

/**
 * Applies a contact change core broadcasts (tRPC `contactFields.sync`) to a
 * plugin's records: a merged contact's records move to the merged one, a
 * removed contact is taken off them. The plugin owns its records' contact
 * fields otherwise.
 */
export const applyContactFieldsSync = async (
  models: TContactFieldsModel[],
  sync: TContactFieldsSync,
) => {
  const oldIds = sync.action === 'merge' ? sync.oldIds : sync.ids;

  if (!oldIds.length) {
    return;
  }

  const field = CONTACT_FIELD_BY_KIND[sync.kind];
  const next = sync.action === 'merge' ? sync.newId : null;

  for (const model of new Set(models)) {
    await model.updateMany(
      { [field]: { $in: oldIds } },
      { $set: { [field]: next } },
    );
  }
};

/**
 * For schemas with `customerId` / `companyId` declared `default: undefined`
 * (so a record not migrated yet stays told apart): gives every new record
 * `null` fields, which marks it as keeping its contact itself.
 */
export const contactFieldsSchemaPlugin = (schema: Schema) => {
  const fill = (doc: IContactFields) => {
    if (doc.customerId === undefined) {
      doc.customerId = null;
    }

    if (doc.companyId === undefined) {
      doc.companyId = null;
    }
  };

  schema.pre('save', function () {
    if (this.isNew) {
      if (this.get('customerId') === undefined) {
        this.set('customerId', null);
      }

      if (this.get('companyId') === undefined) {
        this.set('companyId', null);
      }
    }
  });

  schema.pre('insertMany', function (next, docs: unknown) {
    if (Array.isArray(docs)) {
      docs.forEach((doc: IContactFields) => fill(doc));
    }

    next();
  });
};
