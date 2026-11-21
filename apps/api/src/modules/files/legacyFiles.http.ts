import { BOOLEAN_STRINGS } from '@erxes/core-db/enums';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '~/config';
import { notFound } from '~/http/errors';
import { imageAddress } from './cloudflare';
import { canShowInline, isCoreKey, storage } from './storage';

/**
 * erxes 3.x file links, `<api>/read-file?key=<key>&width=<px>`: in records
 * and text brought over from it, and in emails it sent. They read the bucket
 * erxes 3.x wrote to, in place. As in 3.x there is no sign-in (emails and the
 * messenger load them); the key's random part keeps a file private. Keys of
 * files core stored itself are refused: those go through the signed-in download.
 */
export const legacyFilesRouter = Router();

const Query = z.object({
  key: z
    .string()
    .min(1)
    .max(1024)
    // A plain object key: printable, no traversal, no leading slash.
    .regex(/^[^/\\][\x20-\x7e -￿]*$/)
    .refine((key) => !key.includes('..') && !isCoreKey(key)),
  width: z.coerce.number().int().min(1).max(4096).optional(),
  inline: z.enum(BOOLEAN_STRINGS).optional(),
  name: z.string().max(255).optional(),
});

const TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  txt: 'text/plain',
};

const extensionOf = (key: string) => key.split('.').pop()?.toLowerCase() ?? '';

/** As erxes 3.x judged it: the extension, or "image" anywhere in the key. */
const looksLikeImage = (key: string) =>
  ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extensionOf(key)) || key.includes('image');

/** An image erxes 3.x put in Cloudflare Images, if it is there (it kept others in R2). */
const fromImages = async (key: string, width?: number) => {
  const { driver, cloudflare } = config.files;

  if (driver !== 'cloudflare' || !cloudflare.useCdn || !looksLikeImage(key)) return null;

  const bucket = cloudflare.r2.bucket;
  const address = imageAddress(key.startsWith(`${bucket}/`) ? key : `${bucket}/${key}`, width);

  const found = await fetch(address, { method: 'HEAD', signal: AbortSignal.timeout(10_000) }).then(
    (response) => response.ok,
    () => false,
  );

  return found ? address : null;
};

const fromBucket = async (query: z.infer<typeof Query>) => {
  if (config.files.driver === 'local' || !(await storage().stat(query.key))) return null;

  const contentType = TYPES[extensionOf(query.key)] ?? 'application/octet-stream';

  return storage().downloadUrl(query.key, {
    name: query.name ?? query.key,
    contentType,
    inline: query.inline !== 'false' && canShowInline(contentType),
    expiresIn: config.files.linkTtlSeconds,
  });
};

legacyFilesRouter.get('/read-file', async (req, res) => {
  const query = Query.safeParse(req.query).data;

  const address =
    query && ((await fromImages(query.key, query.width)) ?? (await fromBucket(query)));

  if (!address) throw notFound('File');

  res.setHeader('Cache-Control', 'private, no-store');
  res.redirect(302, address);
});
