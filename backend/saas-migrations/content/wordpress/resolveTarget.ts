import { Db, MongoClient } from 'mongodb';
import type { ObjectId } from 'mongodb';

import { WordPressImportTarget } from './types';

interface OrganizationRecord {
  _id: string;
  subdomain: string;
}

interface StringIdRecord {
  _id: string;
}

interface CmsRecord {
  _id: string | ObjectId;
  clientPortalId: string;
}

const trimSlashes = (value: string): string => {
  let start = 0;
  let end = value.length;

  while (value[start] === '/') {
    start += 1;
  }

  while (end > start && value[end - 1] === '/') {
    end -= 1;
  }

  return value.slice(start, end);
};

export const extractDatabaseName = (
  mongoUrl: string,
  fallback = 'erxes',
): string => {
  const schemeIndex = mongoUrl.indexOf('://');

  if (schemeIndex < 1) {
    throw new Error('MONGO_URL or CORE_MONGO_URL is not a valid MongoDB URL.');
  }

  const pathIndex = mongoUrl.indexOf('/', schemeIndex + 3);

  if (pathIndex === -1) {
    return fallback;
  }

  const encodedDatabaseName = mongoUrl.slice(pathIndex + 1).split('?')[0];
  const databaseName = trimSlashes(encodedDatabaseName);

  if (!databaseName) {
    return fallback;
  }

  try {
    return decodeURIComponent(databaseName);
  } catch {
    throw new Error('MONGO_URL or CORE_MONGO_URL is not a valid MongoDB URL.');
  }
};

export const resolveWordPressTarget = async (
  client: MongoClient,
  coreDb: Db,
  targetSubdomain: string,
  clientPortalId: string,
  adminUserId: string,
): Promise<WordPressImportTarget> => {
  const organization = await coreDb
    .collection<OrganizationRecord>('organizations')
    .findOne({ subdomain: targetSubdomain }, { projection: { _id: 1 } });

  if (!organization) {
    throw new Error(
      `Target organization "${targetSubdomain}" was not found in ${coreDb.databaseName}.organizations.`,
    );
  }

  const targetDbName = `erxes_${String(organization._id)}`;
  const targetDb = client.db(targetDbName);
  const [clientPortal, adminUser, cmsRecords] = await Promise.all([
    targetDb
      .collection<StringIdRecord>('client_portals')
      .findOne({ _id: clientPortalId }, { projection: { _id: 1 } }),
    targetDb
      .collection<StringIdRecord>('users')
      .findOne({ _id: adminUserId }, { projection: { _id: 1 } }),
    targetDb
      .collection<CmsRecord>('content_cms')
      .find({ clientPortalId }, { projection: { _id: 1 } })
      .limit(2)
      .toArray(),
  ]);

  if (!clientPortal) {
    throw new Error(
      `Client portal "${clientPortalId}" was not found in ${targetDbName}.client_portals.`,
    );
  }

  if (!adminUser) {
    throw new Error(
      `Admin user "${adminUserId}" was not found in ${targetDbName}.users.`,
    );
  }

  if (cmsRecords.length === 0) {
    throw new Error(
      `No content CMS is linked to client portal "${clientPortalId}" in ${targetDbName}. Create the web/CMS first, then rerun the import.`,
    );
  }

  if (cmsRecords.length > 1) {
    throw new Error(
      `Client portal "${clientPortalId}" has multiple content CMS records. The importer requires one unambiguous target.`,
    );
  }

  return {
    targetDbName,
    cmsId: cmsRecords[0]._id,
  };
};
