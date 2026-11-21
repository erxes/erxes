import { type Db, fileBuckets, secrets } from '@erxes/core-db';
import { eq, getTableColumns } from 'drizzle-orm';
import { config } from '~/config';
import { openSecret, type WithSecret } from '~/modules/secrets/vault';
import {
  type FileStore,
  type S3Settings,
  s3Storage,
  type Storage,
  type StoredBytes,
  storage,
  storageOf,
} from './storage';

/**
 * An organisation's own S3-compatible bucket (Settings › File upload), offered
 * by self-hosted servers that keep files on their disk. New uploads go to it;
 * each file keeps the store it was written to (`core_files.storage`), and the
 * bucket can't move while files are in it (`bucketSettings.ts`).
 */

export type BucketRow = WithSecret<typeof fileBuckets.$inferSelect>;

export const bucketAndSecret = { bucket: fileBuckets, secret: secrets };

const bucketWithSecret = (client: Db) =>
  client
    .select({ ...getTableColumns(fileBuckets), secret: secrets })
    .from(fileBuckets)
    .innerJoin(secrets, eq(secrets.id, fileBuckets.secretId))
    .limit(1);

type BucketAddress = Pick<BucketRow, 'endpoint' | 'region' | 'bucket' | 'forcePathStyle'>;

/** On erxes.io, or when the server's configuration names a bucket, that decides. */
export const bucketAllowed = () => !config.saas.enabled && config.files.driver === 'local';

export const bucketRow = async (client: Db) => (await bucketWithSecret(client))[0] ?? null;

export const s3SettingsOf = (
  bucket: BucketAddress & { accessKeyId: string },
  secretAccessKey: string,
): S3Settings => ({
  bucket: bucket.bucket,
  region: bucket.region,
  endpoint: bucket.endpoint,
  forcePathStyle: bucket.forcePathStyle,
  accessKeyId: bucket.accessKeyId,
  secretAccessKey,
});

/** Where a bucket is: two settings with the same place hold the same files. */
export const placeOf = (bucket: BucketAddress) => `${bucket.endpoint} ${bucket.bucket}`;

const made = new Map<string, { version: number; storage: Storage }>();

/** The bucket's driver, made once per saved version of its settings. */
const bucketStorage = (row: BucketRow) => {
  const version = row.updatedAt.getTime();
  const found = made.get(row.orgId);

  if (found?.version === version) return found.storage;

  const next = s3Storage(s3SettingsOf(row, openSecret(row.secret)));

  made.set(row.orgId, { version, storage: next });

  return next;
};

const required = (row: BucketRow | null) => {
  if (!row) throw new Error('the organisation has files in its own bucket but no bucket settings');

  return bucketStorage(row);
};

/**
 * Where the scope's organisation stores a new file, and that place. The
 * bucket is read `for share`, so a change to it waits for this transaction
 * and then sees its file.
 */
export const uploadStore = async (client: Db) => {
  const [row] = bucketAllowed()
    ? await bucketWithSecret(client).for('share', { of: fileBuckets })
    : [];

  if (!row) return { name: config.files.driver, bytes: storage(), place: config.files.driver };

  return { name: 'bucket' as const, bytes: bucketStorage(row), place: placeOf(row) };
};

/** Where one of the scope's organisation's files was uploaded to, to complete it. */
export const uploadedTo = async (client: Db, name: FileStore | null): Promise<Storage> =>
  name === 'bucket' ? required(await bucketRow(client)) : storage();

/** Where one of the organisation's files is, given its bucket (null when it has none). */
export const storeWith = (name: FileStore | null, bucket: BucketRow | null): StoredBytes =>
  name === 'bucket' ? required(bucket) : storageOf(name);

/** Where one of the scope's organisation's files is. */
export const storeOf = async (client: Db, name: FileStore | null) =>
  storeWith(name, name === 'bucket' ? await bucketRow(client) : null);
