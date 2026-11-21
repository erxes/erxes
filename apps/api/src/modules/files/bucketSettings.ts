import type { FileBucketInput } from '@erxes/core-contract';
import { caller, type Db, fileBuckets, files, requestOrgId, withOrg } from '@erxes/core-db';
import { count, eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { randomToken } from '~/lib/crypto';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { openSecret, saveSecret } from '~/modules/secrets/vault';
import { bucketAllowed, type BucketRow, bucketRow, placeOf, s3SettingsOf } from './bucket';
import { fileSettingsOf } from './fileSettings';
import { type S3Settings, s3Storage } from './storage';

/** How long the bucket has to take, return and remove the test file. */
const CHECK_SECONDS = 20;

const assertAllowed = () => {
  if (!bucketAllowed()) {
    throw fail(
      'BUCKET_NOT_ALLOWED',
      'This server decides where files are stored; its configuration names the storage',
    );
  }
};

/** The saved secret stays for the same bucket and key id; anything else needs it entered. */
const secretFor = (input: FileBucketInput, before: BucketRow | null) => {
  if (input.secretAccessKey) return input.secretAccessKey;

  if (before && placeOf(before) === placeOf(input) && before.accessKeyId === input.accessKeyId) {
    return openSecret(before.secret);
  }

  const message = 'Enter the secret access key';

  throw fail('INVALID_INPUT', message, { issues: [{ path: ['secretAccessKey'], message }] });
};

const TEST_BYTES = Buffer.from('erxes storage check');

/** Writes a test file the way core stores files, reads it back and removes it. */
const roundTrip = async (settings: S3Settings) => {
  const bucket = s3Storage(settings);
  const key = `erxes-check/${randomToken(8, 'hex')}`;

  await bucket.write(key, TEST_BYTES, 'text/plain');
  const back = await bucket.read(key);

  await bucket.remove(key);

  if (!back.equals(TEST_BYTES)) throw new Error('it returned other bytes');
};

const timeLimit = (seconds: number) =>
  new Promise<never>((_, reject) => {
    AbortSignal.timeout(seconds * 1000).addEventListener('abort', () =>
      reject(new Error(`no answer in ${seconds} s`)),
    );
  });

/** 400 BUCKET_REFUSED with what the bucket answered. Calls out: outside any transaction. */
const checkBucket = async (settings: S3Settings) => {
  try {
    await Promise.race([roundTrip(settings), timeLimit(CHECK_SECONDS)]);
  } catch (error) {
    const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

    throw fail('BUCKET_REFUSED', `The bucket didn’t take a test file. ${reason.slice(0, 300)}`);
  }
};

/** Files of the scope's organisation stored in its bucket, whatever their state. */
const assertEmpty = async (tx: Db) => {
  const { stored } = oneRow(
    await tx.select({ stored: count() }).from(files).where(eq(files.storage, 'bucket')),
  );

  if (stored) {
    throw fail('BUCKET_IN_USE', `${stored} files are stored in the bucket`, { count: stored });
  }
};

/**
 * New uploads go to this bucket from now on, once a test file goes in and
 * out. Moving to another bucket waits for uploads in progress (they read the
 * bucket `for share`) and is refused while files are in the old one.
 */
export const saveBucket = async (input: FileBucketInput) => {
  assertAllowed();

  const orgId = requestOrgId();
  const secret = secretFor(input, await withOrg(orgId, bucketRow));

  await checkBucket(s3SettingsOf(input, secret));

  return withOrg(orgId, async (tx) => {
    const [current] = await tx.select().from(fileBuckets).limit(1).for('update');

    if (current && placeOf(current) !== placeOf(input)) await assertEmpty(tx);

    const values = {
      endpoint: input.endpoint,
      region: input.region,
      bucket: input.bucket,
      forcePathStyle: input.forcePathStyle,
      accessKeyId: input.accessKeyId,
      secretId: await saveSecret(tx, secret, current?.secretId),
      updatedBy: caller('user').userId,
      updatedAt: sql`now()`,
    };

    await tx
      .insert(fileBuckets)
      .values(values)
      .onConflictDoUpdate({ target: fileBuckets.orgId, set: values });

    await recordAudit(tx, {
      action: 'settings.files_bucket_set',
      targetType: 'organization',
      targetId: orgId,
      targetLabel: input.bucket,
      metadata: {
        endpoint: input.endpoint,
        accessKeyId: input.accessKeyId,
        secretChanged: !!input.secretAccessKey,
      },
    });

    return fileSettingsOf(tx);
  });
};

/** New uploads go to the server's storage again; refused while files are in the bucket. */
export const removeBucket = async (client: Db) => {
  const [current] = await client.select().from(fileBuckets).limit(1).for('update');

  if (!current) return fileSettingsOf(client);

  await assertEmpty(client);
  await client.delete(fileBuckets);
  await recordAudit(client, {
    action: 'settings.files_bucket_removed',
    targetType: 'organization',
    targetId: current.orgId,
    targetLabel: current.bucket,
  });

  return fileSettingsOf(client);
};
