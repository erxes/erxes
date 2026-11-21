import { files } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { purgeDeletedFiles } from '~/modules/files/files.service';
import { BUCKET, useCloudflare } from './cloudflare.fixture';
import { adminDb, useTestDatabase } from './db';
import { makeDue, settle } from './settle';
import { type CoreClient, useTwoOrgs } from './support';

const MB = 1024 * 1024;

const rowOf = async (id: string) => {
  const [row] = await adminDb().select().from(files).where(eq(files.id, id));

  if (!row) throw new Error(`file ${id} is gone`);

  return row;
};

/** Uploads straight to the fake R2 and completes. */
const uploaded = async (as: CoreClient, name: string, contentType: string, body: string) => {
  const bytes = Buffer.from(body);
  const started = await as.files.createUpload({ name, contentType, size: bytes.length });

  const put = await fetch(started.upload.url, {
    method: 'PUT',
    headers: started.upload.headers,
    body: bytes,
  });

  expect(put.status).toBe(200);

  return as.files.complete({ id: started.file.id });
};

/** Cloudflare as erxes 3.x SaaS used it: R2 for uploads, Images and Stream after, and its old links. */
describe('Cloudflare files', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const cf = useCloudflare();

  const read = (path: string) => fetch(t.url(path), { redirect: 'manual' });

  const downloadOf = async (id: string) => (await t.member().files.get({ id })).downloadUrl ?? '';

  it('moves an image from R2 to Cloudflare Images and serves it from there', async () => {
    const done = await uploaded(t.member(), 'logo.png', 'image/png', 'png bytes');
    const r2Key = (await rowOf(done.id)).key;

    // Ready at once, from R2.
    expect(await downloadOf(done.id)).toBe(`${cf.base()}/r2/${encodeURIComponent(r2Key)}`);

    await settle();

    const row = await rowOf(done.id);

    expect(row).toMatchObject({ storage: 'cloudflare_images', key: `${done.id}-logo.png` });
    expect(cf.images.get(row.key)?.toString()).toBe('png bytes');
    expect(cf.r2.has(r2Key)).toBe(false);
    expect(await downloadOf(done.id)).toBe(`${cf.base()}/images/hash/${done.id}-logo.png/public`);

    // Deleting the file removes the image.
    await t.member().files.remove({ id: done.id });
    await purgeDeletedFiles();

    expect(cf.images.has(row.key)).toBe(false);
  });

  it('keeps in R2 an image Cloudflare Images refuses, and files that are not media', async () => {
    const odd = await uploaded(t.member(), 'odd.png', 'image/png', 'not an image');
    const text = await uploaded(t.member(), 'notes.txt', 'text/plain', 'hello');

    await settle();

    expect(await rowOf(odd.id)).toMatchObject({ storage: 'cloudflare' });
    expect(await rowOf(text.id)).toMatchObject({ storage: 'cloudflare' });
    expect(await (await fetch(await downloadOf(odd.id))).text()).toBe('not an image');
  });

  it('moves a video to Stream once its MP4 is ready', async () => {
    const done = await uploaded(t.member(), 'demo.mp4', 'video/mp4', 'mp4 bytes');
    const r2Key = (await rowOf(done.id)).key;

    // Stream is still processing: the file plays from R2 meanwhile.
    await settle();

    expect(await rowOf(done.id)).toMatchObject({ storage: 'cloudflare', key: r2Key });

    for (const video of cf.videos.values()) video.ready = true;

    await makeDue();
    await settle();

    const row = await rowOf(done.id);

    expect(row.storage).toBe('cloudflare_stream');
    expect(row.key).toMatch(/\/v\d+\/manifest\/video\.m3u8$/);
    expect(cf.r2.has(r2Key)).toBe(false);
    expect(cf.videos.size).toBe(1);

    const download = await downloadOf(done.id);

    expect(download).toMatch(/\/v\d+\/downloads\/default\.mp4$/);
    expect(await (await fetch(download)).text()).toBe('mp4 bytes');
  });

  it('refuses videos over 200 MB, as Stream did', async () => {
    await expect(
      t.member().files.createUpload({ name: 'long.mp4', contentType: 'video/mp4', size: 201 * MB }),
    ).rejects.toMatchObject({ status: 400, code: 'FILE_TOO_LARGE', data: { maxSizeMb: 200 } });

    // Other files keep the server's limit.
    await expect(
      t
        .member()
        .files.createUpload({ name: 'big.zip', contentType: 'application/zip', size: 300 * MB }),
    ).resolves.toMatchObject({ file: { status: 'pending' } });
  });

  describe('erxes 3.x read-file links', () => {
    it('reads its bucket in place, without sign-in, at its path and core’s', async () => {
      cf.r2.set('a1B2c3report.pdf', Buffer.from('%PDF'));

      for (const prefix of ['/core/v1', '/gateway']) {
        const response = await read(`${prefix}/read-file?key=a1B2c3report.pdf`);

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toBe(`${cf.base()}/r2/a1B2c3report.pdf`);
      }
    });

    it('reads its images from Cloudflare Images, resized, and falls back to R2', async () => {
      cf.images.set(`${BUCKET}/x9Y8photo.jpg`, Buffer.from('jpg'));
      cf.r2.set('k7L6old.png', Buffer.from('png'));

      const resized = await read('/core/v1/read-file?key=x9Y8photo.jpg&width=300');

      expect(resized.headers.get('location')).toBe(
        `${cf.base()}/images/hash/${BUCKET}/x9Y8photo.jpg/w=300`,
      );

      const fullKey = await read(`/core/v1/read-file?key=${BUCKET}/x9Y8photo.jpg`);

      expect(fullKey.headers.get('location')).toBe(
        `${cf.base()}/images/hash/${BUCKET}/x9Y8photo.jpg/public`,
      );

      const inR2 = await read('/core/v1/read-file?key=k7L6old.png');

      expect(inR2.headers.get('location')).toBe(`${cf.base()}/r2/k7L6old.png`);
    });

    it('refuses missing keys, traversal and the keys of files core stored', async () => {
      const done = await uploaded(t.member(), 'private.txt', 'text/plain', 'secret');
      const coreKey = (await rowOf(done.id)).key;

      expect(cf.r2.has(coreKey)).toBe(true);

      for (const key of ['missing.pdf', '../a1B2c3report.pdf', '/a1B2c3report.pdf', coreKey]) {
        const response = await read(`/core/v1/read-file?key=${encodeURIComponent(key)}`);

        expect(response.status).toBe(404);
      }
    });
  });
});
