import { type Db, files, withOrg } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { logger } from '~/logger';
import { defineJob } from '~/modules/jobs/jobs';
import {
  cloudflareImages,
  cloudflareStream,
  copyVideo,
  imageIdOf,
  mp4Ready,
  putImage,
  removeVideo,
  video,
  videoOf,
} from './cloudflare';
import { storage } from './storage';

const log = logger.child({ component: 'files' });

const MB = 1024 * 1024;

/** Stream took videos up to this size in erxes 3.x; larger ones were refused. */
const VIDEO_LIMIT_MB = 200;

/** Images Cloudflare Images takes; erxes 3.x kept SVG, HEIC and icons in R2. */
const IMAGE = /^image\/(jpeg|png|gif|webp)$/;

const VIDEO = /^video\//;

const usesCdn = () => config.files.driver === 'cloudflare' && config.files.cloudflare.useCdn;

/** Where a file of this type goes after R2, if anywhere. */
const targetOf = (contentType: string) => {
  if (!usesCdn()) return null;

  if (IMAGE.test(contentType)) return 'cloudflare_images' as const;

  return VIDEO.test(contentType) ? ('cloudflare_stream' as const) : null;
};

/** Throws for a video Stream wouldn't take. */
export const assertStreamable = (input: { contentType: string; size: number }) => {
  if (targetOf(input.contentType) === 'cloudflare_stream' && input.size > VIDEO_LIMIT_MB * MB) {
    throw fail('FILE_TOO_LARGE', `Videos can be up to ${VIDEO_LIMIT_MB} MB`, {
      maxSizeMb: VIDEO_LIMIT_MB,
    });
  }
};

const Payload = z.object({ fileId: z.string(), key: z.string() });

type Move = z.infer<typeof Payload> & { orgId: string; lastAttempt: boolean };

/** A link Cloudflare fetches the R2 object from: an hour, so Stream can take its time. */
const sourceOf = (key: string, file: { name: string; contentType: string }) =>
  storage().downloadUrl(key, {
    name: file.name,
    contentType: file.contentType,
    inline: true,
    expiresIn: 3600,
  });

/**
 * Stores the video in Stream and waits for its MP4. Its HLS address once it
 * plays; null when Stream can't take it (the file stays in R2). Throws to try
 * again later while Stream is still working.
 */
const toStream = async (move: Move, file: { name: string; contentType: string }) => {
  const started =
    (await videoOf(move.fileId)) ??
    (await copyVideo(await sourceOf(move.key, file), move.fileId, file.name));

  const current = await video(started.uid);

  if (current.status.state === 'error') {
    await removeVideo(current.uid);

    return null;
  }

  if (current.readyToStream && current.playback && (await mp4Ready(current.uid))) {
    return current.playback.hls;
  }

  if (move.lastAttempt) {
    await removeVideo(current.uid);

    return null;
  }

  throw new Error(`video ${current.uid} is still processing`);
};

const toImages = async (move: Move, file: { name: string; contentType: string }) => {
  const id = imageIdOf(move.fileId, file.name);

  return (await putImage(id, await sourceOf(move.key, file))) ? id : null;
};

/**
 * Moves one ready file from R2 to Cloudflare Images or Stream. Each step can
 * run again: the image id and the video's `creator` come from the file, and
 * the row changes only while it is still ready under the R2 key.
 */
const moveToCloudflare = async (move: Move) => {
  const [file] = await withOrg(move.orgId, (tx) =>
    tx.select().from(files).where(eq(files.id, move.fileId)).limit(1),
  );

  if (!file) return;

  if (file.key !== move.key) {
    // Moved by an attempt that stopped before removing the R2 copy.
    if (file.storage === 'cloudflare_images' || file.storage === 'cloudflare_stream') {
      await storage().remove(move.key);
    }

    return;
  }

  const target = targetOf(file.contentType);

  if (file.status !== 'ready' || file.storage !== 'cloudflare' || !target) return;

  const key =
    target === 'cloudflare_images' ? await toImages(move, file) : await toStream(move, file);

  if (!key) {
    log.warn({ fileId: file.id, target }, 'Cloudflare would not take the file; it stays in R2');

    return;
  }

  const moved = await withOrg(move.orgId, (tx) =>
    tx
      .update(files)
      .set({ storage: target, key, updatedAt: sql`now()` })
      .where(and(eq(files.id, file.id), eq(files.status, 'ready'), eq(files.key, move.key)))
      .returning({ id: files.id }),
  );

  if (!moved.length) {
    // Deleted meanwhile: its purge removes the R2 copy, this removes ours.
    await (target === 'cloudflare_images' ? cloudflareImages : cloudflareStream).remove(key);

    return;
  }

  await storage().remove(move.key);
};

export const cloudflareMoveJob = defineJob({
  queue: 'files.cloudflare',
  payload: Payload,
  // Stream works on a video for minutes: up to about four hours of tries.
  timeoutSeconds: 180,
  handle: ({ orgId, payload, lastAttempt }) => moveToCloudflare({ ...payload, orgId, lastAttempt }),
});

/** Queues the move of a file that just became ready in R2, in the completion's transaction. */
export const queueCloudflareMove = async (
  client: Db,
  file: { id: string; orgId: string; key: string; contentType: string },
) => {
  if (!targetOf(file.contentType)) return;

  await cloudflareMoveJob.enqueue(client, {
    orgId: file.orgId,
    payload: { fileId: file.id, key: file.key },
    dedupeKey: `file:${file.id}`,
  });
};
