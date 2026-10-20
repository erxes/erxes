import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListPartsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ExpectedError } from 'erxes-api-shared/utils';
import { createReadStream, createWriteStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { IModels } from '~/connectionResolvers';
import {
  getConfig,
  getFileUploadConfigs,
} from '~/modules/organization/settings/utils/configs';

export type TFilesStorage = {
  client: S3Client;
  bucket: string;
};

export type TStoragePart = {
  partNumber: number;
  etag: string;
  size: number;
};

const SIGNED_PART_TTL_SECONDS = 30 * 60;
const SIGNED_READ_TTL_SECONDS = 5 * 60;
// pdf.js keeps reading ranges for as long as the document is open.
export const SIGNED_VIEWER_TTL_SECONDS = 30 * 60;

export const getFilesStorage = async (
  models: IModels,
): Promise<TFilesStorage> => {
  const bucket = await getConfig('FILES_BUCKET', '', models);

  if (!bucket) {
    throw new ExpectedError(
      'File storage is not configured: set FILES_BUCKET',
      'FILES_STORAGE_NOT_CONFIGURED',
    );
  }

  const configs = await getFileUploadConfigs(models);

  if (configs.UPLOAD_SERVICE_TYPE === 'CLOUDFLARE') {
    if (
      !configs.CLOUDFLARE_ACCOUNT_ID ||
      !configs.CLOUDFLARE_ACCESS_KEY_ID ||
      !configs.CLOUDFLARE_SECRET_ACCESS_KEY
    ) {
      throw new ExpectedError(
        'Cloudflare R2 credentials are not configured',
        'FILES_STORAGE_NOT_CONFIGURED',
      );
    }

    return {
      bucket,
      client: new S3Client({
        region: 'auto',
        endpoint: `https://${configs.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: configs.CLOUDFLARE_ACCESS_KEY_ID,
          secretAccessKey: configs.CLOUDFLARE_SECRET_ACCESS_KEY,
        },
      }),
    };
  }

  if (configs.UPLOAD_SERVICE_TYPE === 'AWS') {
    const accessKeyId = await getConfig('AWS_ACCESS_KEY_ID', '', models);
    const secretAccessKey = await getConfig('AWS_SECRET_ACCESS_KEY', '', models);
    const region = await getConfig('AWS_REGION', 'us-east-1', models);
    const endpoint = await getConfig(
      'AWS_COMPATIBLE_SERVICE_ENDPOINT',
      '',
      models,
    );
    const forcePathStyle = await getConfig('AWS_FORCE_PATH_STYLE', '', models);

    if (!accessKeyId || !secretAccessKey) {
      throw new ExpectedError(
        'AWS credentials are not configured',
        'FILES_STORAGE_NOT_CONFIGURED',
      );
    }

    return {
      bucket,
      client: new S3Client({
        region,
        ...(endpoint ? { endpoint } : {}),
        forcePathStyle: forcePathStyle === 'true',
        credentials: { accessKeyId, secretAccessKey },
      }),
    };
  }

  throw new ExpectedError(
    'Files needs S3-compatible storage (Cloudflare R2, AWS S3 or MinIO)',
    'FILES_STORAGE_UNSUPPORTED',
  );
};

export const startMultipartUpload = async (
  { client, bucket }: TFilesStorage,
  key: string,
  contentType: string,
) => {
  const { UploadId } = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
  );

  if (!UploadId) {
    throw new Error('Storage did not return an upload id');
  }

  return UploadId;
};

export const signUploadPart = (
  { client, bucket }: TFilesStorage,
  key: string,
  uploadId: string,
  partNumber: number,
) =>
  getSignedUrl(
    client,
    new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    }),
    { expiresIn: SIGNED_PART_TTL_SECONDS },
  );

export const signSingleUpload = (
  { client, bucket }: TFilesStorage,
  key: string,
  contentType: string,
) =>
  getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: SIGNED_PART_TTL_SECONDS },
  );

// Parts are read back with ListParts, so buckets need no ETag ExposeHeaders.
export const listUploadedParts = async (
  { client, bucket }: TFilesStorage,
  key: string,
  uploadId: string,
): Promise<TStoragePart[]> => {
  const parts: TStoragePart[] = [];
  let marker: string | undefined;

  do {
    const response = await client.send(
      new ListPartsCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumberMarker: marker,
      }),
    );

    for (const part of response.Parts || []) {
      if (part.PartNumber && part.ETag) {
        parts.push({
          partNumber: part.PartNumber,
          etag: part.ETag,
          size: part.Size || 0,
        });
      }
    }

    marker = response.IsTruncated ? response.NextPartNumberMarker : undefined;
  } while (marker);

  return parts;
};

export const completeMultipartUpload = async (
  { client, bucket }: TFilesStorage,
  key: string,
  uploadId: string,
  parts: TStoragePart[],
) => {
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(({ partNumber, etag }) => ({
          PartNumber: partNumber,
          ETag: etag,
        })),
      },
    }),
  );
};

export const abortMultipartUpload = async (
  { client, bucket }: TFilesStorage,
  key: string,
  uploadId: string,
) => {
  try {
    await client.send(
      new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
      }),
    );
  } catch (e) {
    // Already completed, aborted or expired: nothing to abort.
    if ((e as { name?: string }).name !== 'NoSuchUpload') {
      throw e;
    }
  }
};

export const headObjectSize = async (
  { client, bucket }: TFilesStorage,
  key: string,
) => {
  const head = await client.send(
    new HeadObjectCommand({ Bucket: bucket, Key: key }),
  );

  return head.ContentLength || 0;
};

export const readObjectHead = async (
  { client, bucket }: TFilesStorage,
  key: string,
  bytes: number,
) => {
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: `bytes=0-${bytes - 1}`,
    }),
  );

  if (!response.Body) {
    return Buffer.alloc(0);
  }

  return Buffer.from(await response.Body.transformToByteArray());
};

export const signRead = (
  { client, bucket }: TFilesStorage,
  key: string,
  {
    fileName,
    contentType,
    inline,
    expiresIn = SIGNED_READ_TTL_SECONDS,
    signingDate,
  }: {
    fileName: string;
    contentType: string;
    inline: boolean;
    expiresIn?: number;
    signingDate?: Date;
  },
) => {
  // HTTP headers need ASCII; filename* keeps the Unicode name.
  const asciiName = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, '');
  const encodedName = encodeURIComponent(fileName);

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentType: contentType,
      ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
    }),
    { expiresIn, signingDate },
  );
};

// Streams to disk: derivatives come from files of several hundred MB.
export const downloadObject = async (
  { client, bucket }: TFilesStorage,
  key: string,
  filePath: string,
) => {
  const response = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  if (!response.Body) {
    throw new Error(`Storage returned no body for ${key}`);
  }

  await pipeline(response.Body as Readable, createWriteStream(filePath));
};

export const uploadObject = async (
  { client, bucket }: TFilesStorage,
  key: string,
  filePath: string,
  contentType: string,
  cacheControl?: string,
) => {
  const { size } = await stat(filePath);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: createReadStream(filePath),
      ContentLength: size,
      ContentType: contentType,
      ...(cacheControl ? { CacheControl: cacheControl } : {}),
    }),
  );
};

export const deleteObjects = async (
  { client, bucket }: TFilesStorage,
  keys: string[],
) => {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);

    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  }
};
