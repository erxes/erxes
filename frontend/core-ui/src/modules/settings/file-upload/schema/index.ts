import { z } from 'zod';

const COMMON_FILE_UPLOAD_FIELDS = {
  UPLOAD_FILE_TYPES: z.array(
    z.object({ label: z.string(), value: z.string() }),
  ),
  WIDGETS_UPLOAD_FILE_TYPES: z.array(
    z.object({ label: z.string(), value: z.string() }),
  ),
  FILE_SYSTEM_PUBLIC: z.string(),
};

const AWS_FIELDS_SCHEMA = z.object({
  UPLOAD_SERVICE_TYPE: z.literal('AWS'),
  ...COMMON_FILE_UPLOAD_FIELDS,
  AWS_ACCESS_KEY_ID: z
    .string()
    .min(16, { message: 'Access key id must be at least 16 characters.' })
    .max(128, { message: 'Access key id must be at most 128 characters.' })
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Access key ID is required when configuring AWS',
    }),
  AWS_SECRET_ACCESS_KEY: z
    .string()
    .min(16, { message: 'Secret access key must be at least 16 characters.' })
    .max(128, { message: 'Secret access key must be at most 128 characters.' })
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Secret access key is required when configuring AWS',
    }),
  AWS_BUCKET: z
    .string()
    .min(3, { message: 'Bucket name must be at least 3 characters.' })
    .max(63, { message: 'Bucket name must be at most 63 characters.' })
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Bucket is required when configuring AWS',
    }),
  AWS_PREFIX: z.string().optional(),
  AWS_COMPATIBLE_SERVICE_ENDPOINT: z.string().optional(),
  AWS_FORCE_PATH_STYLE: z.string().optional(),
});

const GCS_FIELDS_SCHEMA = z.object({
  UPLOAD_SERVICE_TYPE: z.literal('GCS'),
  ...COMMON_FILE_UPLOAD_FIELDS,
  GCS_BUCKET: z
    .string()
    .min(3, { message: 'Bucket name must be at least 3 characters.' })
    .max(63, { message: 'Bucket name must be at most 63 characters.' })
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Bucket is required when configuring Google Cloud Service',
    }),
});

const CLOUDFLARE_FIELDS_SCHEMA = z.object({
  UPLOAD_SERVICE_TYPE: z.literal('CLOUDFLARE'),
  ...COMMON_FILE_UPLOAD_FIELDS,
  CLOUDFLARE_ACCOUNT_ID: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Account ID is required when configuring CLOUDFLARE',
    }),
  CLOUDFLARE_API_TOKEN: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'API token is required when configuring CLOUDFLARE',
    }),
  CLOUDFLARE_ACCESS_KEY_ID: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Access key ID is required when configuring CLOUDFLARE',
    }),
  CLOUDFLARE_SECRET_ACCESS_KEY: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Secret access key is required when configuring CLOUDFLARE',
    }),
  CLOUDFLARE_BUCKET_NAME: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Bucket name is required when configuring CLOUDFLARE',
    }),
  CLOUDFLARE_ACCOUNT_HASH: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Account hash is required when configuring CLOUDFLARE',
    }),
  CLOUDFLARE_USE_CDN: z.boolean().optional(),
});

const AZURE_FIELDS_SCHEMA = z.object({
  UPLOAD_SERVICE_TYPE: z.literal('AZURE'),
  ...COMMON_FILE_UPLOAD_FIELDS,
  ABS_CONTAINER_NAME: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Container name is required when configuring Azure',
    }),
  AB_CONNECTION_STRING: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Connection string is required when configuring Azure',
    }),
});

const LOCAL_FIELD = z.object({
  UPLOAD_SERVICE_TYPE: z.literal('local'),
});

const FILES_VALIDATION_SCHEMA = z.discriminatedUnion('UPLOAD_SERVICE_TYPE', [
  LOCAL_FIELD,
  AWS_FIELDS_SCHEMA,
  GCS_FIELDS_SCHEMA,
  CLOUDFLARE_FIELDS_SCHEMA,
  AZURE_FIELDS_SCHEMA,
]);

export { FILES_VALIDATION_SCHEMA };
