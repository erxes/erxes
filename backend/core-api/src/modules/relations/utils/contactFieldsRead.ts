import {
  CONTACT_FIELD_BY_KIND,
  CONTACT_FIELD_RECORD_PLUGINS,
  CONTACT_KIND_BY_CONTENT_TYPE,
  IContactFieldsRecord,
  TContactFieldsFind,
  TContactKind,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

interface IRelationQuery {
  contentType: string;
  contentIds: string[];
  relatedContentType: string;
}

// A record ↔ contact link read from a record's fields, shaped as a relation.
interface IFieldRelation {
  _id: string;
  entities: { contentType: string; contentId: string }[];
  createdAt: Date;
  updatedAt: Date;
}

// `null` when the plugin cannot answer (disabled, older, or not migrated).
const findInPlugin = (
  subdomain: string,
  pluginName: string,
  input: TContactFieldsFind,
): Promise<IContactFieldsRecord[] | null> =>
  sendTRPCMessage({
    subdomain,
    pluginName,
    method: 'query',
    module: 'contactFields',
    action: 'find',
    input,
    defaultValue: null,
  });

const toRelation = (
  contact: { contentType: string; contentId: string },
  record: { contentType: string; contentId: string },
  { createdAt, updatedAt }: IContactFieldsRecord,
): IFieldRelation => ({
  // Stable per pair, so caches see one link however often it is read.
  _id: `${contact.contentType}:${contact.contentId}|${record.contentType}:${record.contentId}`,
  entities: [contact, record],
  createdAt: createdAt || new Date(0),
  updatedAt: updatedAt || createdAt || new Date(0),
});

const contactIdsOf = (record: IContactFieldsRecord, kind: TContactKind) =>
  record[CONTACT_FIELD_BY_KIND[kind]];

/**
 * Answers a relation query between contacts and records that keep their
 * contacts as `customerIds` / `companyIds` from those fields, asking the
 * record's plugin. Returns `null` for any other query, or when the plugin
 * cannot answer, so the caller reads `relations` as before.
 */
export const relationsFromContactFields = async (
  subdomain: string,
  models: IModels,
  { contentType, contentIds, relatedContentType }: IRelationQuery,
): Promise<IFieldRelation[] | null> => {
  const ids = [...new Set(contentIds.filter(Boolean))];

  // Contacts → their records: the deals of these customers.
  const contactKind = CONTACT_KIND_BY_CONTENT_TYPE[contentType];
  const recordPlugin = CONTACT_FIELD_RECORD_PLUGINS[relatedContentType];

  if (contactKind && recordPlugin) {
    const records = await findInPlugin(subdomain, recordPlugin, {
      contentType: relatedContentType,
      customerIds: contactKind === 'customer' ? ids : [],
      companyIds: contactKind === 'company' ? ids : [],
    });

    if (!records) {
      return null;
    }

    const wanted = new Set(ids);

    return records.flatMap((record) =>
      contactIdsOf(record, contactKind)
        .filter((contactId) => wanted.has(contactId))
        .map((contactId) =>
          toRelation(
            { contentType, contentId: contactId },
            { contentType: relatedContentType, contentId: record._id },
            record,
          ),
        ),
    );
  }

  // Records → their contacts: the customers of this deal.
  const ownerPlugin = CONTACT_FIELD_RECORD_PLUGINS[contentType];
  const relatedKind = CONTACT_KIND_BY_CONTENT_TYPE[relatedContentType];

  if (!ownerPlugin || !relatedKind) {
    return null;
  }

  const records = await findInPlugin(subdomain, ownerPlugin, {
    contentType,
    ids,
  });

  if (!records) {
    return null;
  }

  const fromFields = records.flatMap((record) =>
    contactIdsOf(record, relatedKind).map((contactId) =>
      toRelation(
        { contentType: relatedContentType, contentId: contactId },
        { contentType, contentId: record._id },
        record,
      ),
    ),
  );

  // Records not migrated yet still keep their contacts in relations.
  const answered = new Set(records.map((record) => record._id));
  const unanswered = ids.filter((id) => !answered.has(id));

  if (!unanswered.length) {
    return fromFields;
  }

  const fromRelations = await models.Relations.filterRelations({
    contentType,
    contentIds: unanswered,
    relatedContentType,
  });

  return [...fromFields, ...fromRelations];
};
