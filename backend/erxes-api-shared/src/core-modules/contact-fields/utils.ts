import { FilterQuery, Model, Schema, UpdateQuery } from 'mongoose';
import {
  CONTACT_FIELD_RECORD_PLUGINS,
  CONTACT_KIND_BY_CONTENT_TYPE,
  TContactKind,
} from './constants';
import { IContactFields, IContactLink, TContactFieldsSync } from './types';

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
