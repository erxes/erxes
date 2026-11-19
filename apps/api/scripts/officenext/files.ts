/**
 * Old attachments (`{ url, name, type, size }`) as `core_files` rows that keep the old URL or key
 * as the file's key; copying the bytes is a later step. A file's id comes from its key, so a
 * second run finds the same file.
 */
import { z } from 'zod';
import { sha256 } from '~/lib/crypto';
import { insert, type Run } from './run';
import { amount, field, text } from './values';

export const Attachment = z.object({ url: text, name: text, type: text, size: amount });

export type Attachment = z.infer<typeof Attachment>;

/** Every attachment in a field holding one, a list, or nothing. */
export const attachments = field((value) =>
  [value].flat().flatMap((item) => {
    const parsed = Attachment.safeParse(item);

    return parsed.success && parsed.data.url ? [parsed.data] : [];
  }),
);

/** The file id an old URL or key gets. */
export const fileIdOf = (key: string) => `f${sha256(key).slice(0, 20)}`;

/** Writes the attachments as ready files; returns their ids in the same order. */
export const saveFiles = async (
  run: Run,
  collection: string,
  files: { attachment: Attachment; actorId: string | null; at: Date }[],
) => {
  const unique = new Map(files.map((file) => [file.attachment.url ?? '', file]));

  unique.delete('');

  await insert(run, {
    collection: `${collection} (files)`,
    table: 'core_files',
    columns: [
      'id',
      'key',
      'name',
      'content_type',
      'size',
      'status',
      'actor_type',
      'actor_id',
      'created_at',
      'updated_at',
    ],
    rows: [...unique].map(([key, file]) => [
      fileIdOf(key),
      key,
      file.attachment.name ?? key.split('/').at(-1) ?? key,
      file.attachment.type ?? 'application/octet-stream',
      Math.max(0, Math.round(file.attachment.size ?? 0)),
      'ready',
      file.actorId ? 'user' : 'system',
      file.actorId,
      file.at,
      file.at,
    ]),
    keys: [...unique.keys()],
    conflict: 'ON CONFLICT DO NOTHING',
  });

  return files.flatMap((file) => (file.attachment.url ? [fileIdOf(file.attachment.url)] : []));
};
