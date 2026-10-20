import { FilterQuery, Model, Schema, UpdateQuery } from 'mongoose';
import {
  CONTACT_FIELD_RECORD_PLUGINS,
  CONTACT_KIND_BY_CONTENT_TYPE,
  TContactKind,
} from './constants';
import {
  IContactFields,
  IContactFieldsRecord,
  IContactLink,
  TContactFieldsFind,
  TContactFieldsSync,
} from './types';

type TEntity = { contentType?: string; contentId?: string };

/**
 * The record ↔ contact links among `relations`, for records that keep their
 * contacts as fields. Relations between two records, or two contacts, are
 * not contact links.
 */
export const getContactLinks = (
  relations: { entities?: TEntity[] }[],
): IContactLink[] =>
  relations.flatMap(({ entities = [] }) => {
    const contact = entities.find(
      (entity) =>
        entity.contentType && CONTACT_KIND_BY_CONTENT_TYPE[entity.contentType],
    );
    const record = entities.find(
      (entity) =>
        entity.contentType && CONTACT_FIELD_RECORD_PLUGINS[entity.contentType],
    );

    if (
      !contact?.contentType ||
      !contact.contentId ||
      !record?.contentType ||
      !record.contentId
    ) {
      return [];
    }

    return [
      {
        contentType: record.contentType,
        contentId: record.contentId,
        kind: CONTACT_KIND_BY_CONTENT_TYPE[contact.contentType],
        contactId: contact.contentId,
      },
    ];
  });

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

const linkUpdate = (
  kind: TContactKind,
  contactId: string,
  link: boolean,
): UpdateQuery<IContactFields> => {
  if (kind === 'customer') {
    return link
      ? { $addToSet: { customerIds: contactId } }
      : { $pull: { customerIds: contactId } };
  }

  return link
    ? { $addToSet: { companyIds: contactId } }
    : { $pull: { companyIds: contactId } };
};

const fieldFilter = (
  kind: TContactKind,
  condition: FilterQuery<IContactFields>[keyof IContactFields],
): FilterQuery<IContactFields> =>
  kind === 'customer' ? { customerIds: condition } : { companyIds: condition };

/**
 * Applies a sync from core to a plugin's records, keyed by content type.
 * Only adds or removes the ids named, so ids written to the fields directly
 * stay. Links touch only records that already have the field: a record not
 * migrated yet is filled whole by the migration, never piecemeal.
 */
export const applyContactFieldsSync = async (
  modelsByContentType: Record<string, TContactFieldsModel>,
  sync: TContactFieldsSync,
) => {
  if (sync.action === 'merge' || sync.action === 'remove') {
    const models = [...new Set(Object.values(modelsByContentType))];
    const oldIds = sync.action === 'merge' ? sync.oldIds : sync.ids;

    if (!oldIds.length) {
      return;
    }

    for (const model of models) {
      if (sync.action === 'merge') {
        await model.updateMany(
          fieldFilter(sync.kind, { $in: oldIds }),
          linkUpdate(sync.kind, sync.newId, true),
        );
      }

      await model.updateMany(
        fieldFilter(sync.kind, { $in: oldIds }),
        sync.kind === 'customer'
          ? { $pull: { customerIds: { $in: oldIds } } }
          : { $pull: { companyIds: { $in: oldIds } } },
      );
    }

    return;
  }

  for (const link of sync.links) {
    const model = modelsByContentType[link.contentType];

    if (!model) {
      continue;
    }

    await model.updateOne(
      {
        _id: link.contentId,
        ...fieldFilter(link.kind, { $exists: true }),
      },
      linkUpdate(link.kind, link.contactId, sync.action === 'link'),
    );
  }
};

// The most records one lookup by contacts returns, newest first.
const MAX_FIND_RECORDS = 200;

const FIND_PROJECTION: Record<string, 1> = {
  customerIds: 1,
  companyIds: 1,
  createdAt: 1,
  updatedAt: 1,
};

type TFoundDoc = IContactFields & {
  _id: unknown;
  createdAt?: Date;
  updatedAt?: Date;
};

// The query calls `findContactFieldsRecords` makes on a plugin's model.
interface IContactFieldsFindQuery {
  sort(order: Record<string, 1 | -1>): IContactFieldsFindQuery;
  limit(count: number): IContactFieldsFindQuery;
  lean(): PromiseLike<TFoundDoc[]>;
}

interface IContactFieldsFindModel extends IContactFieldsExists {
  find(
    filter: FilterQuery<IContactFields>,
    projection: Record<string, 1>,
  ): IContactFieldsFindQuery;
}

const toFoundRecord = (doc: TFoundDoc): IContactFieldsRecord => ({
  _id: String(doc._id),
  customerIds: doc.customerIds || [],
  companyIds: doc.companyIds || [],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

/**
 * Answers core's `contactFields.find` from a plugin's records. By contacts it
 * returns `null` until every record has its fields, so core reads relations
 * instead; by ids it returns only the records that have them.
 */
export const findContactFieldsRecords = async (
  model: IContactFieldsFindModel,
  cacheKey: string,
  input: TContactFieldsFind,
): Promise<IContactFieldsRecord[] | null> => {
  if ('ids' in input) {
    if (!input.ids.length) {
      return [];
    }

    const docs = await model
      .find({ _id: { $in: input.ids } }, FIND_PROJECTION)
      .lean();

    return docs.filter((doc) => hasContactFields(doc)).map(toFoundRecord);
  }

  if (!(await contactFieldsReady(model, cacheKey))) {
    return null;
  }

  const or: FilterQuery<IContactFields>[] = [];

  if (input.customerIds.length) {
    or.push({ customerIds: { $in: input.customerIds } });
  }

  if (input.companyIds.length) {
    or.push({ companyIds: { $in: input.companyIds } });
  }

  if (!or.length) {
    return [];
  }

  const docs = await model
    .find({ $or: or }, FIND_PROJECTION)
    .sort({ createdAt: -1 })
    .limit(Math.min(input.limit || MAX_FIND_RECORDS, MAX_FIND_RECORDS))
    .lean();

  return docs.map(toFoundRecord);
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
