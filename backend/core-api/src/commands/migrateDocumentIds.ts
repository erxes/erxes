import * as dotenv from 'dotenv';
import { ClientSession, Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { isDeepStrictEqual } from 'node:util';

type StoredDocument = { _id: string | ObjectId } & Record<string, unknown>;
type DocumentIdMapping = { _id: string; objectId: ObjectId };
type Organization = { _id: string | ObjectId; subdomain: string };
type ContentReferenceUpdate = {
  collection: Collection<StoredDocument>;
  documentId: StoredDocument['_id'];
  changes: Record<string, unknown>;
};

const BATCH_SIZE = 100;
const CONTENT_TYPE = 'core:documents';
const CONTENT_FIELDS: Record<string, string[]> = {
  documents: ['content', 'replacer'],
  automation_email_templates: ['content', 'contentJson'],
  broadcast_engage_messages: ['email'],
  automations: ['actions'],
  favorites: ['path'],
};

const replaceReferences = (
  value: unknown,
  ids: Map<string, string>,
  key?: string,
): unknown => {
  if (typeof value === 'string') {
    if (key === 'documentId') return ids.get(value) || value;

    return value
      .replace(
        /^document\.([\w-]+)$/,
        (_match: string, id: string) => `document.${ids.get(id) || id}`,
      )
      .replace(
        /(\{\{\s*document\.)([\w-]+)(\s*\}\})/g,
        (_match: string, prefix: string, id: string, suffix: string) =>
          `${prefix}${ids.get(id) || id}${suffix}`,
      )
      .replace(
        /("documentId"\s*:\s*")([\w-]+)(")/g,
        (_match: string, prefix: string, id: string, suffix: string) =>
          `${prefix}${ids.get(id) || id}${suffix}`,
      )
      .replace(
        /(data-document-id=\\?["'])([\w-]+)(\\?["'])/g,
        (_match: string, prefix: string, id: string, suffix: string) =>
          `${prefix}${ids.get(id) || id}${suffix}`,
      )
      .replace(
        /([?&]documentId=)([\w-]+)/g,
        (_match: string, prefix: string, id: string) =>
          `${prefix}${ids.get(id) || id}`,
      );
  }

  if (Array.isArray(value)) {
    const updated = value.map((item: unknown) => replaceReferences(item, ids));
    return updated.some((item, index) => item !== value[index])
      ? updated
      : value;
  }

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    const entries = Object.entries(value);
    const updated = entries.map(([field, item]) => [
      field,
      replaceReferences(item, ids, field),
    ]);
    return updated.some(([, item], index) => item !== entries[index][1])
      ? Object.fromEntries(updated)
      : value;
  }

  return value;
};

async function* getContentReferenceUpdates(
  db: Db,
  ids: Map<string, string>,
  session: ClientSession,
): AsyncGenerator<ContentReferenceUpdate> {
  for (const [name, fields] of Object.entries(CONTENT_FIELDS)) {
    const collection = db.collection<StoredDocument>(name);
    const cursor = collection.find(
      {},
      {
        projection: Object.fromEntries(fields.map((field) => [field, 1])),
        batchSize: BATCH_SIZE,
        session,
      },
    );

    for await (const document of cursor) {
      const changes: Record<string, unknown> = {};
      for (const field of fields) {
        const updated = replaceReferences(document[field], ids);
        if (updated !== document[field]) changes[field] = updated;
      }
      if (Object.keys(changes).length) {
        yield { collection, documentId: document._id, changes };
      }
    }
  }
}

const migrateReferences = async (
  db: Db,
  oldId: string,
  newId: string,
  session: ClientSession,
): Promise<void> => {
  const approvalFilter = { contentType: CONTENT_TYPE, contentId: oldId };
  const approvalUpdate = { $set: { contentId: newId } };

  await db
    .collection('approval_locks')
    .updateMany(approvalFilter, approvalUpdate, { session });
  await db
    .collection('approval_requests')
    .updateMany(approvalFilter, approvalUpdate, { session });
  await db
    .collection('internal_notes')
    .updateMany(
      { contentType: CONTENT_TYPE, contentTypeId: oldId },
      { $set: { contentTypeId: newId } },
      { session },
    );
  await db.collection('notifications').updateMany(
    {
      'metadata.targetContentType': CONTENT_TYPE,
      'metadata.targetContentId': oldId,
    },
    { $set: { 'metadata.targetContentId': newId } },
    { session },
  );
  await db.collection('relations').updateMany(
    {
      entities: {
        $elemMatch: { contentType: CONTENT_TYPE, contentId: oldId },
      },
    },
    { $set: { 'entities.$[entity].contentId': newId } },
    {
      session,
      arrayFilters: [
        { 'entity.contentType': CONTENT_TYPE, 'entity.contentId': oldId },
      ],
    },
  );

  const ids = new Map([[oldId, newId]]);
  for await (const {
    collection,
    documentId,
    changes,
  } of getContentReferenceUpdates(db, ids, session)) {
    await collection.updateOne(
      { _id: documentId },
      { $set: changes },
      { session },
    );
  }
};

const migrateDocument = async (
  db: Db,
  documentId: StoredDocument['_id'],
  session: ClientSession,
): Promise<boolean> => {
  const documents = db.collection<StoredDocument>('documents');
  const mappings = db.collection<DocumentIdMapping>('document_id_migrations');
  const document = await documents.findOne({ _id: documentId }, { session });
  if (!document || typeof document._id !== 'string') return false;

  const mapping = await mappings.findOneAndUpdate(
    { _id: document._id },
    { $setOnInsert: { objectId: new ObjectId() } },
    { session, upsert: true, returnDocument: 'after' },
  );
  if (!mapping) throw new Error(`Could not map document ${document._id}`);

  const copy = { ...document, _id: mapping.objectId };
  const existing = await documents.findOne(
    { _id: mapping.objectId },
    { session },
  );
  if (existing) {
    const knownIds = new Map<string, string>();
    for await (const known of mappings.find({}, { session })) {
      knownIds.set(known._id, known.objectId.toHexString());
    }
    if (
      !isDeepStrictEqual(
        replaceReferences(existing, knownIds),
        replaceReferences(copy, knownIds),
      )
    ) {
      throw new Error(
        `Document ${document._id} and its existing ObjectId copy differ. Neither was overwritten; reconcile both records before retrying.`,
      );
    }
  } else {
    await documents.insertOne(copy, { session });
  }

  await migrateReferences(
    db,
    document._id,
    mapping.objectId.toHexString(),
    session,
  );
  const result = await documents.deleteOne({ _id: document._id }, { session });
  if (result.deletedCount !== 1) {
    throw new Error(`Could not remove original document ${document._id}`);
  }
  return true;
};

export const migrateDocumentIds = async (
  db: Db,
  client: MongoClient,
  dryRun = false,
): Promise<number> => {
  const documents = db.collection<StoredDocument>('documents');
  const filter = { _id: { $type: 'string' as const } };
  if (dryRun) {
    const count = await documents.countDocuments(filter);
    console.info(`[${db.databaseName}] Would migrate ${count} document(s)`);
    return count;
  }

  const topology: { setName?: string; msg?: string } = await db.command({
    hello: 1,
  });
  if (!topology.setName && topology.msg !== 'isdbgrid') {
    throw new Error(
      'Document ID migration requires a MongoDB replica set or mongos so copying, approval changes, and deletion can commit atomically. No data was changed.',
    );
  }

  const cursor = documents.find(filter, {
    batchSize: BATCH_SIZE,
    projection: { _id: 1 },
  });
  const session = client.startSession();
  let count = 0;

  try {
    for await (const row of cursor) {
      const migrated = await session.withTransaction(
        () => migrateDocument(db, row._id, session),
        {
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary',
        },
      );
      if (migrated) count += 1;
    }
  } finally {
    await cursor.close();
    await session.endSession();
  }

  console.info(`[${db.databaseName}] Migrated ${count} document(s)`);
  return count;
};

export const runDocumentIdMigration = async (): Promise<void> => {
  dotenv.config();
  const { MONGO_URL, CORE_MONGO_URL, VERSION, DB_NAME, DRY_RUN } = process.env;
  if (!MONGO_URL) throw new Error('Environment variable MONGO_URL not set.');
  if (VERSION === 'saas' && !CORE_MONGO_URL) {
    throw new Error('Environment variable CORE_MONGO_URL not set for SaaS.');
  }
  const databaseTemplate = DB_NAME || 'erxes_<organizationId>';
  if (VERSION === 'saas' && !databaseTemplate.includes('<organizationId>')) {
    throw new Error('SaaS DB_NAME must contain <organizationId>.');
  }

  const client = new MongoClient(MONGO_URL);
  const coreClient =
    VERSION === 'saas' && CORE_MONGO_URL
      ? new MongoClient(CORE_MONGO_URL)
      : undefined;
  const dryRun = DRY_RUN === '1' || DRY_RUN === 'true';

  try {
    await client.connect();
    if (!coreClient) {
      await migrateDocumentIds(client.db(), client, dryRun);
      return;
    }

    await coreClient.connect();
    const organizations = coreClient
      .db()
      .collection<Organization>('organizations');
    const failures: string[] = [];
    for await (const organization of organizations.find(
      {},
      { projection: { _id: 1, subdomain: 1 } },
    )) {
      const databaseName = databaseTemplate.replace(
        '<organizationId>',
        String(organization._id),
      );
      try {
        await migrateDocumentIds(client.db(databaseName), client, dryRun);
      } catch (error: unknown) {
        failures.push(organization.subdomain);
        console.error(
          `Document ID migration failed for ${organization.subdomain}`,
          error,
        );
      }
    }
    if (failures.length) {
      throw new Error(
        `Document ID migration failed for: ${failures.join(', ')}`,
      );
    }
  } finally {
    await Promise.all([client.close(), coreClient?.close()]);
  }
};

if (require.main === module) {
  runDocumentIdMigration().catch((error: unknown) => {
    console.error('Document ID migration failed', error);
    process.exitCode = 1;
  });
}
