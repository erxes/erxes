// Self-contained port of the storage upload used by erxes-api-shared's
// `uploadFileToStorage`. The migration image deliberately ships only a Mongo
// client and tsx, so it cannot import erxes-api-shared: that module reaches the
// core service over tRPC just to read the storage configs. Everything it needs
// is already in the organization database, so the configs are read directly and
// the upload is performed here.
//
// The returned string is what ends up in `attachment.url`, so each branch must
// return exactly what erxes-api-shared returns, or the app will not resolve the
// files afterwards.
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { Db } from 'mongodb';
import { fetch, FormData } from 'undici';

import { randomAlphanumeric } from './generateId';

const STORAGE_CONFIG_CODES = [
  'UPLOAD_SERVICE_TYPE',
  'FILE_SYSTEM_PUBLIC',
  'AWS_BUCKET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_COMPATIBLE_SERVICE_ENDPOINT',
  'AWS_FORCE_PATH_STYLE',
  'AWS_REGION',
  'AWS_PREFIX',
  'AWS_DISABLE_ACL',
  'CLOUDFLARE_BUCKET_NAME',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_ACCESS_KEY_ID',
  'CLOUDFLARE_SECRET_ACCESS_KEY',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_USE_CDN',
];

export type StorageConfigMap = Record<string, string>;

export interface StorageUploadOptions {
  filePath: string;
  fileName: string;
  mimetype: string;
}

export type StorageUpload = (
  options: StorageUploadOptions,
) => Promise<string>;

interface CloudflareResponse {
  success: boolean;
  result?: {
    variants?: string[];
    playback?: { hls?: string };
  };
}

export const loadStorageConfigs = async (
  db: Db,
): Promise<StorageConfigMap> => {
  const documents = await db
    .collection('configs')
    .find({ code: { $in: STORAGE_CONFIG_CODES } })
    .toArray();

  const configs: StorageConfigMap = {};

  for (const document of documents) {
    if (document.value !== undefined && document.value !== null) {
      configs[document.code] = String(document.value);
    }
  }

  return configs;
};

// Mirrors erxes-api-shared: an organization-level config wins, otherwise the
// value falls back to the process environment.
const readConfigValue = (
  configs: StorageConfigMap,
  code: string,
  defaultValue = '',
): string => configs[code] ?? process.env[code] ?? defaultValue;

const requireConfigValue = (
  configs: StorageConfigMap,
  code: string,
): string => {
  const value = readConfigValue(configs, code);

  if (!value) {
    throw new Error(`${code} is not configured`);
  }

  return value;
};

// Deliberately strict, exactly like erxes-api-shared: only the literal string
// "true" enables a flag, so "1" stays false.
const parseBoolean = (value?: string): boolean =>
  (value || '').toLowerCase() === 'true';

const ILLEGAL_CHARACTERS = /[/?<>\\:*|"]/g;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\x00-\x1f\x80-\x9f]/g;
const RESERVED_NAME = /^\.+$/g;
const WINDOWS_RESERVED_NAME = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/gi;

export const sanitizeFilename = (input: string): string => {
  const sanitized = input
    .replaceAll(ILLEGAL_CHARACTERS, '')
    .replaceAll(CONTROL_CHARACTERS, '')
    .replaceAll(RESERVED_NAME, '')
    .replaceAll(WINDOWS_RESERVED_NAME, '');

  let end = sanitized.length;

  while (end > 0 && (sanitized[end - 1] === ' ' || sanitized[end - 1] === '.')) {
    end--;
  }

  return [...sanitized.substring(0, end)].slice(0, 255).join('');
};

const createS3Client = async (options: {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  region?: string;
  forcePathStyle?: boolean;
}) => {
  const { S3Client } = await import('@aws-sdk/client-s3');

  return new S3Client({
    credentials: {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    },
    ...(options.endpoint ? { endpoint: options.endpoint } : {}),
    region: options.region || 'auto',
    ...(options.forcePathStyle ? { forcePathStyle: true } : {}),
  });
};

const putObject = async (options: {
  client: Awaited<ReturnType<typeof createS3Client>>;
  bucket: string;
  key: string;
  body: Buffer;
  mimetype: string;
  acl?: string;
}): Promise<void> => {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');

  await options.client.send(
    new PutObjectCommand({
      Bucket: options.bucket,
      Key: options.key,
      Body: options.body,
      ContentType: options.mimetype,
      ...(options.acl ? { ACL: options.acl as 'public-read' } : {}),
    }),
  );
};

const buildPublicUrl = (
  endpoint: string,
  bucket: string,
  key: string,
  region: string,
  forcePathStyle: boolean,
): string => {
  if (endpoint) {
    const base = endpoint.replace(/\/+$/, '');
    return forcePathStyle
      ? `${base}/${bucket}/${key}`
      : `${base.replace('://', `://${bucket}.`)}/${key}`;
  }

  return `https://${bucket}.s3.${region || 'us-east-1'}.amazonaws.com/${key}`;
};

const uploadToAws = async (
  configs: StorageConfigMap,
  { filePath, fileName, mimetype }: StorageUploadOptions,
  forcePrivate: boolean,
): Promise<string> => {
  const isPublic = forcePrivate
    ? false
    : parseBoolean(readConfigValue(configs, 'FILE_SYSTEM_PUBLIC', 'true'));
  const disableAcl = parseBoolean(readConfigValue(configs, 'AWS_DISABLE_ACL'));

  const bucket = requireConfigValue(configs, 'AWS_BUCKET');
  const prefix = readConfigValue(configs, 'AWS_PREFIX');
  const endpoint = readConfigValue(
    configs,
    'AWS_COMPATIBLE_SERVICE_ENDPOINT',
  );
  const region = readConfigValue(configs, 'AWS_REGION');
  const forcePathStyle = parseBoolean(
    readConfigValue(configs, 'AWS_FORCE_PATH_STYLE'),
  );

  const key = `${prefix}${randomAlphanumeric()}${sanitizeFilename(fileName)}`;
  const client = await createS3Client({
    accessKeyId: requireConfigValue(configs, 'AWS_ACCESS_KEY_ID'),
    secretAccessKey: requireConfigValue(configs, 'AWS_SECRET_ACCESS_KEY'),
    endpoint,
    region,
    forcePathStyle,
  });

  await putObject({
    client,
    bucket,
    key,
    body: await readFile(filePath),
    mimetype,
    acl: isPublic && !disableAcl ? 'public-read' : undefined,
  });

  return isPublic
    ? buildPublicUrl(endpoint, bucket, key, region, forcePathStyle)
    : key;
};

const uploadToCloudflareImages = async (
  configs: StorageConfigMap,
  { filePath, fileName }: StorageUploadOptions,
  isPublic: boolean,
): Promise<string> => {
  const accountId = requireConfigValue(configs, 'CLOUDFLARE_ACCOUNT_ID');
  const apiToken = requireConfigValue(configs, 'CLOUDFLARE_API_TOKEN');
  const bucketName = requireConfigValue(configs, 'CLOUDFLARE_BUCKET_NAME');

  let finalFileName = `${randomAlphanumeric()}${sanitizeFilename(fileName)}`;
  const extension = finalFileName.split('.').pop();

  if (extension && ['JPEG', 'JPG', 'PNG'].includes(extension)) {
    finalFileName = `${finalFileName.slice(
      0,
      -(extension.length + 1),
    )}.${extension.toLowerCase()}`;
  }

  const body = new FormData();
  body.append(
    'file',
    new Blob([new Uint8Array(await readFile(filePath))]),
    sanitizeFilename(fileName),
  );
  body.append('id', `${bucketName}/${finalFileName}`);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}` },
      body,
    },
  );

  const data = (await response.json()) as CloudflareResponse;

  if (!data.success) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  const variants = data.result?.variants || [];

  if (variants.length === 0) {
    throw new Error('Error uploading file to Cloudflare Images - no variants');
  }

  return isPublic ? variants[0] : `${bucketName}/${finalFileName}`;
};

const uploadToCloudflareStream = async (
  configs: StorageConfigMap,
  { filePath, fileName }: StorageUploadOptions,
): Promise<string> => {
  const accountId = requireConfigValue(configs, 'CLOUDFLARE_ACCOUNT_ID');
  const apiToken = requireConfigValue(configs, 'CLOUDFLARE_API_TOKEN');

  const finalFileName = `${randomAlphanumeric()}${sanitizeFilename(fileName)}`;

  const body = new FormData();
  body.append(
    'file',
    new Blob([new Uint8Array(await readFile(filePath))]),
    sanitizeFilename(fileName),
  );
  body.append('id', finalFileName);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}` },
      body,
    },
  );

  const data = (await response.json()) as CloudflareResponse;

  if (!data.success || !data.result?.playback?.hls) {
    throw new Error('Error uploading file to Cloudflare Stream');
  }

  return data.result.playback.hls;
};

const isImageMimetype = (mimetype: string): boolean =>
  mimetype.includes('image');

const isVideoMimetype = (mimetype: string): boolean =>
  mimetype.includes('video');

// Cloudflare Images cannot process these, so they take the R2 path even when
// the CDN is enabled. Matches the exclusion list in erxes-api-shared.
const CDN_EXCLUDED_IMAGE_TYPES = [
  'image/heic',
  'image/heif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

const uploadToCloudflare = async (
  configs: StorageConfigMap,
  options: StorageUploadOptions,
  forcePrivate: boolean,
): Promise<string> => {
  const isPublic = forcePrivate
    ? false
    : parseBoolean(readConfigValue(configs, 'FILE_SYSTEM_PUBLIC', 'false'));
  const useCdn = parseBoolean(readConfigValue(configs, 'CLOUDFLARE_USE_CDN'));

  const buffer = await readFile(options.filePath);

  // The declared mimetype comes from the WordPress export, so the real content
  // is sniffed the same way erxes-api-shared does before routing to a CDN.
  const { fileTypeFromBuffer } = await import('file-type');
  const detected = await fileTypeFromBuffer(new Uint8Array(buffer));
  const detectedMimetype = detected?.mime || '';

  const fileName =
    extname(options.fileName).toLowerCase() === '.jfif'
      ? options.fileName.replace('.jfif', '.jpeg')
      : options.fileName;

  if (
    useCdn &&
    detectedMimetype &&
    isImageMimetype(detectedMimetype) &&
    !CDN_EXCLUDED_IMAGE_TYPES.includes(detectedMimetype)
  ) {
    return uploadToCloudflareImages(
      configs,
      { ...options, fileName },
      isPublic,
    );
  }

  if (useCdn && detectedMimetype && isVideoMimetype(detectedMimetype)) {
    return uploadToCloudflareStream(configs, { ...options, fileName });
  }

  const bucketName = requireConfigValue(configs, 'CLOUDFLARE_BUCKET_NAME');
  const accountId = requireConfigValue(configs, 'CLOUDFLARE_ACCOUNT_ID');
  const key = `${randomAlphanumeric()}${sanitizeFilename(options.fileName)}`;

  const client = await createS3Client({
    accessKeyId: requireConfigValue(configs, 'CLOUDFLARE_ACCESS_KEY_ID'),
    secretAccessKey: requireConfigValue(
      configs,
      'CLOUDFLARE_SECRET_ACCESS_KEY',
    ),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    region: 'auto',
  });

  await putObject({
    client,
    bucket: bucketName,
    key,
    body: buffer,
    mimetype: options.mimetype,
    acl: isPublic ? 'public-read' : undefined,
  });

  return isPublic
    ? `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`
    : key;
};

export const createStorageUpload = async (db: Db): Promise<StorageUpload> => {
  const configs = await loadStorageConfigs(db);
  const uploadType = readConfigValue(
    configs,
    'UPLOAD_SERVICE_TYPE',
    'AWS',
  ).toUpperCase();

  // erxes forces every SaaS file to be private, which decides whether a key or
  // a public URL is stored on the attachment.
  const forcePrivate = process.env.VERSION === 'saas';

  if (uploadType === 'CLOUDFLARE' || uploadType === 'AWS') {
    console.log(
      `Media storage: ${uploadType}${forcePrivate ? ' (saas, private)' : ''}`,
    );
  }

  if (uploadType === 'CLOUDFLARE') {
    return (options) => uploadToCloudflare(configs, options, forcePrivate);
  }

  if (uploadType === 'AWS') {
    return (options) => uploadToAws(configs, options, forcePrivate);
  }

  throw new Error(
    `Unsupported UPLOAD_SERVICE_TYPE "${uploadType}" for the WordPress media import. Only AWS (including S3-compatible endpoints) and CLOUDFLARE are implemented; set SKIP_MEDIA=1 to import content without media.`,
  );
};
