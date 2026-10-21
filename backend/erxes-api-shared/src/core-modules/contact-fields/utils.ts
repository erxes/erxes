import { FilterQuery, Model, Schema } from 'mongoose';
import { TContactKind } from './constants';
import { IContactFields, TContactFieldsSync } from './types';

/**
 * Whether a record's contact fields can be trusted. Both are set once the
 * record is migrated or created after the fields existed; before that, its
 * contacts are still read from `relations`.
 */
export const hasContactFields = (
  doc?: IContactFields | null,
): doc is Required<IContactFields> =>
  Array.isArray(doc?.customerIds) && Array.isArray(doc?.companyIds);

const READY_RECHECK_MS = 60 * 1000;
const readiness = new Map<string, { ready: boolean; checkedAt: number }>();

/**
 * Whether every record in a collection has its contact fields, so queries
 * may filter on them. Once true it stays true (new records always get the
 * fields); until then it is rechecked at most once a minute.
 */
// Any model whose records keep contact fields.
interface IContactFieldsExists {
  exists(filter: FilterQuery<IContactFields>): PromiseLike<unknown>;
}

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

  // `null` matches a missing field and can use the field's index.
  const missing = await model.exists({
    $or: [{ customerIds: null }, { companyIds: null }],
  });
  const ready = !missing;

  readiness.set(cacheKey, { ready, checkedAt: Date.now() });

  return ready;
};

type TContactFieldsModel = Pick<
  Model<IContactFields>,
  'updateOne' | 'updateMany'
>;

const addContact = (kind: TContactKind, contactId: string) =>
  kind === 'customer'
    ? { $addToSet: { customerIds: contactId } }
    : { $addToSet: { companyIds: contactId } };

const fieldFilter = (
  kind: TContactKind,
  condition: FilterQuery<IContactFields>[keyof IContactFields],
): FilterQuery<IContactFields> =>
  kind === 'customer' ? { customerIds: condition } : { companyIds: condition };

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

  for (const model of new Set(models)) {
    if (sync.action === 'merge') {
      await model.updateMany(
        fieldFilter(sync.kind, { $in: oldIds }),
        addContact(sync.kind, sync.newId),
      );
    }

    await model.updateMany(
      fieldFilter(sync.kind, { $in: oldIds }),
      sync.kind === 'customer'
        ? { $pull: { customerIds: { $in: oldIds } } }
        : { $pull: { companyIds: { $in: oldIds } } },
    );
  }
};

/**
 * For schemas with `customerIds` / `companyIds` declared `default:
 * undefined` (so a record not migrated yet stays told apart): gives every
 * new record empty fields, which marks it as keeping its contacts itself.
 */
export const contactFieldsSchemaPlugin = (schema: Schema) => {
  const fill = (doc: IContactFields) => {
    if (doc.customerIds === undefined) {
      doc.customerIds = [];
    }

    if (doc.companyIds === undefined) {
      doc.companyIds = [];
    }
  };

  schema.pre('save', function () {
    if (this.isNew) {
      if (this.get('customerIds') === undefined) {
        this.set('customerIds', []);
      }

      if (this.get('companyIds') === undefined) {
        this.set('companyIds', []);
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
