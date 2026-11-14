import { FILE_STORAGES } from '@erxes/core-db/enums';
import { files } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, IdList, isoDate } from './common';

export const FileInfo = createSelectSchema(files, {
  id: Id,
  size: () => z.int(),
  createdAt: isoDate,
})
  .pick({
    id: true,
    name: true,
    contentType: true,
    /** Bytes. */
    size: true,
    /** `pending` until `complete`; files being deleted are never returned. */
    status: true,
    /** `core` or the plugin that uploaded it. */
    source: true,
    /** Who uploaded it: a team member (`actorId` = user id), a plugin (its name) or `system`. */
    actorType: true,
    actorId: true,
    createdAt: true,
  })
  .extend({
    /**
     * Stable address for signed-in members (`/core/v1/files/<id>/download`):
     * it checks the session, then redirects to a short-lived storage link.
     * Use it for `<img src>` and links. The query selects it with the row.
     */
    url: z.string(),
  });

export type FileInfo = z.infer<typeof FileInfo>;

/** Where and how to send the bytes: one HTTP request, then `complete`. */
export const UploadTarget = z.object({
  method: z.literal('PUT'),
  url: z.string(),
  /** Send exactly these headers with the bytes. */
  headers: z.record(z.string(), z.string()),
  expiresAt: z.iso.datetime(),
});

export type UploadTarget = z.infer<typeof UploadTarget>;

/** What an organisation accepts (Settings → File upload). */
export const FileSettings = z.object({
  /** Largest upload in MB. */
  maxSizeMb: z.int().min(1),
  /** MIME types (`image/png`), wildcards (`image/*`) or extensions (`.pdf`). Empty: any type. */
  allowedTypes: z.array(z.string()),
  /** The deployment's limit; `maxSizeMb` can't go above it. */
  limitMb: z.int(),
  /** Where files are stored. */
  storage: z.enum(FILE_STORAGES),
});

export type FileSettings = z.infer<typeof FileSettings>;

const AllowedType = z
  .string()
  .trim()
  .toLowerCase()
  .max(100)
  .regex(
    /^(\.[a-z0-9]{1,15}|[a-z0-9][a-z0-9.+-]*\/(\*|[a-z0-9][a-z0-9.+-]*))$/,
    '.ext, type/subtype or type/*',
  );

export const filesContract = {
  createUpload: oc
    .route({
      method: 'POST',
      path: '/files',
      successStatus: 201,
      summary:
        'Start an upload: checks the name, type and size against the organisation settings and returns where to PUT the bytes. 400 FILE_TOO_LARGE / FILE_TYPE_NOT_ALLOWED',
    })
    .input(
      z.object({
        name: z.string().trim().min(1).max(255),
        contentType: z
          .string()
          .trim()
          .toLowerCase()
          .max(255)
          .regex(/^[a-z0-9][a-z0-9.+-]*\/[a-z0-9][a-z0-9.+-]*$/, 'type/subtype'),
        /** Bytes; the stored object must match it. */
        size: z.int().min(0),
      }),
    )
    .output(z.object({ file: FileInfo, upload: UploadTarget })),
  complete: oc
    .route({
      method: 'POST',
      path: '/files/{id}/complete',
      summary:
        'Finish an upload once the bytes are sent: core checks the stored object. 409 UPLOAD_INCOMPLETE if it is missing or the size differs',
    })
    .input(z.object({ id: Id }))
    .output(FileInfo),
  get: oc
    .route({
      method: 'GET',
      path: '/files/{id}',
      summary: 'A file, with a short-lived `downloadUrl`',
    })
    .input(z.object({ id: Id }))
    .output(FileInfo.extend({ downloadUrl: z.string().nullable() })),
  list: oc
    .route({
      method: 'GET',
      path: '/files',
      summary: 'Files by id (ready ones only), e.g. a record’s attachments',
    })
    .input(z.object({ ids: IdList }))
    .output(z.object({ data: z.array(FileInfo).max(100) })),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/files/{id}',
      summary: 'Delete a file and its stored bytes (the uploader, or owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  settings: oc
    .route({
      method: 'GET',
      path: '/settings/files',
      summary: 'What the organisation accepts as uploads',
    })
    .output(FileSettings),
  updateSettings: oc
    .route({
      method: 'PUT',
      path: '/settings/files',
      summary: 'Change upload limits (owners and admins)',
    })
    .input(
      z.object({
        maxSizeMb: z.int().min(1).max(10_000),
        allowedTypes: z.array(AllowedType).max(100),
      }),
    )
    .output(FileSettings),
};
