import { FILE_STORAGES } from '@erxes/core-db/enums';
import { fileBuckets, files } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
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
    /** A picture for emails, open to anyone at `publicUrl`. */
    public: true,
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
    /**
     * A public file's address for anyone (`/core/v1/files/public/<id>`), with no sign-in:
     * what an email shows. Null for every other file.
     */
    publicUrl: z.string().nullable(),
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

/** The organisation's own S3-compatible bucket; the secret is never sent back. */
export const FileBucket = createSelectSchema(fileBuckets, { updatedAt: isoDate }).pick({
  /** The S3 API address. */
  endpoint: true,
  region: true,
  bucket: true,
  /** `<endpoint>/<bucket>` addresses (MinIO) rather than `<bucket>.<endpoint>`. */
  forcePathStyle: true,
  accessKeyId: true,
  updatedAt: true,
});

/** What an organisation accepts (Settings → File upload). */
export const FileSettings = z.object({
  /** Largest upload in MB. */
  maxSizeMb: z.int().min(1),
  /** MIME types (`image/png`), wildcards (`image/*`) or extensions (`.pdf`). Empty: any type. */
  allowedTypes: z.array(z.string()),
  /** The deployment's limit; `maxSizeMb` can't go above it. */
  limitMb: z.int(),
  /** Where the server stores files (FILES_STORAGE). */
  storage: z.enum(FILE_STORAGES),
  /** Whether the organisation may store files in its own bucket: a self-hosted server on its disk. */
  bucketAllowed: z.boolean(),
  /** The organisation's own bucket, where new uploads go; null: the server's storage. */
  bucket: FileBucket.nullable(),
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

/** Where to store new uploads: an S3-compatible bucket and a key that may read and write it. */
export const FileBucketInput = z.object({
  endpoint: z.url({ protocol: /^https?$/ }).max(500),
  region: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'auto, us-east-1 …'),
  bucket: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/,
      '3 to 63 lowercase letters, digits, dots, hyphens',
    ),
  forcePathStyle: z.boolean(),
  accessKeyId: z.string().trim().min(1).max(128),
  /** Left out on a change to the same address and key id: the saved one stays. */
  secretAccessKey: z.string().min(1).max(256).optional(),
});

export type FileBucketInput = z.infer<typeof FileBucketInput>;

const {
  BUCKET_IN_USE,
  BUCKET_NOT_ALLOWED,
  BUCKET_REFUSED,
  FILE_TOO_LARGE,
  FILE_TYPE_NOT_ALLOWED,
  LIMIT_EXCEEDED,
  MASS_DELETE_STOPPED,
  UPLOAD_CHANGED,
  UPLOAD_INCOMPLETE,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  FILE_TOO_LARGE,
  FILE_TYPE_NOT_ALLOWED,
  LIMIT_EXCEEDED,
  MASS_DELETE_STOPPED,
  UPLOAD_CHANGED,
  UPLOAD_INCOMPLETE,
});

/** The organisation's own bucket. */
const bucketBase = base.errors({ BUCKET_IN_USE, BUCKET_NOT_ALLOWED, BUCKET_REFUSED });

export const filesContract = {
  createUpload: base
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
        /**
         * A picture for emails (PNG, JPEG, GIF or WebP): once ready, anyone with its
         * `publicUrl` can open it, as mail clients do. Set only here, never after.
         */
        public: z.boolean().optional(),
      }),
    )
    .output(z.object({ file: FileInfo, upload: UploadTarget })),
  complete: base
    .route({
      method: 'POST',
      path: '/files/{id}/complete',
      summary:
        'Finish an upload once the bytes are sent: core checks the stored object. 409 UPLOAD_INCOMPLETE if it is missing or the size differs',
    })
    .input(z.object({ id: Id }))
    .output(FileInfo),
  get: base
    .route({
      method: 'GET',
      path: '/files/{id}',
      summary: 'A file, with a short-lived `downloadUrl`',
    })
    .input(z.object({ id: Id }))
    .output(FileInfo.extend({ downloadUrl: z.string().nullable() })),
  list: base
    .route({
      method: 'GET',
      path: '/files',
      summary: 'Files by id (ready ones only), e.g. a record’s attachments',
    })
    .input(z.object({ ids: IdList }))
    .output(z.object({ data: z.array(FileInfo).max(100) })),
  remove: base
    .route({
      method: 'DELETE',
      path: '/files/{id}',
      summary: 'Delete a file and its stored bytes (the uploader, or owners and admins)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  settings: base
    .route({
      method: 'GET',
      path: '/settings/files',
      summary: 'What the organisation accepts as uploads',
    })
    .output(FileSettings),
  updateSettings: base
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
  saveBucket: bucketBase
    .route({
      method: 'PUT',
      path: '/settings/files/bucket',
      summary:
        'Store new uploads in the organisation’s own bucket, once a test file goes in and out (owners and admins). 403 BUCKET_NOT_ALLOWED on erxes.io or when the server sets the storage, 400 BUCKET_REFUSED when the test fails, 409 BUCKET_IN_USE to move to another bucket while files are in this one',
    })
    .input(FileBucketInput)
    .output(FileSettings),
  removeBucket: bucketBase
    .route({
      method: 'DELETE',
      path: '/settings/files/bucket',
      summary:
        'Store new uploads on the server again (owners and admins). 409 BUCKET_IN_USE while files are in the bucket',
    })
    .output(FileSettings),
};
