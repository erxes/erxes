import { files } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { purgeDeletedFiles } from '~/modules/files/files.service';
import { adminDb, useTestDatabase } from './db';
import { ACCESS_KEY_ID, useFakeS3 } from './s3.fixture';
import { type CoreClient, useTwoOrgs } from './support';

const storageOf = async (id: string) => {
  const [row] = await adminDb()
    .select({ storage: files.storage, key: files.key })
    .from(files)
    .where(eq(files.id, id));

  if (!row) throw new Error(`file ${id} is gone`);

  return row;
};

/** Uploads to wherever core says and completes; the link is core's own or the bucket's. */
const uploaded = async (
  as: CoreClient,
  url: (path: string) => string,
  name: string,
  body: string,
) => {
  const bytes = Buffer.from(body);

  const started = await as.files.createUpload({
    name,
    contentType: 'text/plain',
    size: bytes.length,
  });

  const target = started.upload.url.startsWith('http')
    ? started.upload.url
    : url(started.upload.url);

  const put = await fetch(target, { method: 'PUT', headers: started.upload.headers, body: bytes });

  expect(put.ok).toBe(true);

  return as.files.complete({ id: started.file.id });
};

/** A self-hosted organisation's own S3-compatible bucket (Settings › File upload). */
describe('files in the organisation’s own bucket', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const s3 = useFakeS3();

  const bucketInput = (bucket = 'erxes-files') => ({
    endpoint: s3.endpoint(),
    region: 'us-east-1',
    bucket,
    forcePathStyle: true,
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: 'fake-secret',
  });

  const text = async (as: CoreClient, id: string) => {
    const { downloadUrl } = await as.files.get({ id });
    const link = downloadUrl ?? '';

    return (await fetch(link.startsWith('http') ? link : t.url(link))).text();
  };

  it('stores new uploads in the bucket once a test file goes in and out, and keeps older files readable', async () => {
    const before = await uploaded(t.member(), t.url, 'before.txt', 'on the server');

    expect(await t.owner().files.settings()).toMatchObject({ bucketAllowed: true, bucket: null });

    const saved = await t.owner().files.saveBucket(bucketInput());

    expect(saved.bucket).toMatchObject({ bucket: 'erxes-files', accessKeyId: ACCESS_KEY_ID });
    expect(saved.bucket).not.toHaveProperty('secretSealed');
    // The test file is gone again.
    expect([...(s3.buckets.get('erxes-files')?.keys() ?? [])]).toEqual([]);

    const after = await uploaded(t.member(), t.url, 'after.txt', 'in the bucket');
    const stored = await storageOf(after.id);

    expect(stored.storage).toBe('bucket');
    expect(s3.buckets.get('erxes-files')?.get(stored.key)?.body.toString()).toBe('in the bucket');
    expect(await text(t.member(), after.id)).toBe('in the bucket');

    expect(await storageOf(before.id)).toMatchObject({ storage: 'local' });
    expect(await text(t.member(), before.id)).toBe('on the server');

    // The other organisation still stores on the server.
    expect((await t.other().files.settings()).bucket).toBeNull();
    expect(await storageOf((await uploaded(t.other(), t.url, 'x.txt', 'x')).id)).toMatchObject({
      storage: 'local',
    });
  });

  it('refuses a bucket that won’t take the test file, and keeps the secret only for the same bucket and key', async () => {
    await expect(
      t.owner().files.saveBucket({ ...bucketInput(), accessKeyId: 'wrong-key' }),
    ).rejects.toMatchObject({ status: 400, code: 'BUCKET_REFUSED' });
    await expect(
      t.owner().files.saveBucket({ ...bucketInput(), bucket: 'missing' }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'BUCKET_REFUSED',
    });

    await t.owner().files.saveBucket(bucketInput());

    const { secretAccessKey: _secret, ...withoutSecret } = bucketInput();

    await expect(
      t.owner().files.saveBucket({ ...withoutSecret, accessKeyId: 'another-key' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      t.owner().files.saveBucket({ ...withoutSecret, region: 'auto' }),
    ).resolves.toMatchObject({ bucket: { region: 'auto' } });

    await expect(t.member().files.saveBucket(bucketInput())).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
  });

  it('won’t leave a bucket that holds files until they are deleted', async () => {
    await t.owner().files.saveBucket(bucketInput());
    await uploaded(t.member(), t.url, 'kept.txt', 'kept');

    const stored = await adminDb()
      .select({ id: files.id, key: files.key })
      .from(files)
      .where(eq(files.storage, 'bucket'));

    const inUse = { status: 409, code: 'BUCKET_IN_USE', data: { count: stored.length } };

    await expect(t.owner().files.saveBucket(bucketInput('other-files'))).rejects.toMatchObject(
      inUse,
    );
    await expect(t.owner().files.removeBucket()).rejects.toMatchObject(inUse);

    // Deleting them removes their bytes from the bucket.
    await Promise.all(stored.map(({ id }) => t.owner().files.remove({ id })));
    await purgeDeletedFiles();

    expect(stored.filter(({ key }) => s3.buckets.get('erxes-files')?.has(key))).toEqual([]);
    await expect(t.owner().files.removeBucket()).resolves.toMatchObject({ bucket: null });
    expect(await storageOf((await uploaded(t.member(), t.url, 'n.txt', 'n')).id)).toMatchObject({
      storage: 'local',
    });
  });

  it('is not offered where the server decides the storage', async () => {
    const saas = config.saas.enabled;

    config.saas.enabled = true;

    try {
      expect(await t.owner().files.settings()).toMatchObject({ bucketAllowed: false });
      await expect(t.owner().files.saveBucket(bucketInput())).rejects.toMatchObject({
        status: 403,
        code: 'BUCKET_NOT_ALLOWED',
      });
    } finally {
      config.saas.enabled = saas;
    }
  });
});
