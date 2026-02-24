import { BlobServiceClient } from '@azure/storage-blob';
import { Storage } from '@google-cloud/storage';
import AWS from 'aws-sdk';
import { fileTypeFromBuffer } from 'file-type/core';
import FormData from 'form-data';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import { tmpdir } from 'os';
import { sendTRPCMessage } from '../trpc';
import { getEnv, isImage, isVideo } from '../utils';
import { sanitizeFilename } from '../sanitize';
import { randomAlphanumeric } from '../random';

const STORAGE_CONFIG_CODES = [
  'UPLOAD_SERVICE_TYPE',
  'AWS_BUCKET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_COMPATIBLE_SERVICE_ENDPOINT',
  'AWS_FORCE_PATH_STYLE',
  'AWS_REGION',
  'AWS_PREFIX',
  'GOOGLE_CLOUD_STORAGE_BUCKET',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GOOGLE_PROJECT_ID',
  'CLOUDFLARE_BUCKET_NAME',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_ACCESS_KEY_ID',
  'CLOUDFLARE_SECRET_ACCESS_KEY',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_USE_CDN',
  'CLOUDFLARE_ACCOUNT_HASH',
  'AZURE_STORAGE_CONNECTION_STRING',
  'AZURE_STORAGE_CONTAINER',
  'FILE_SYSTEM_PUBLIC',
] as const;

type StorageConfigCode = (typeof STORAGE_CONFIG_CODES)[number];
type StorageConfigMap = Record<StorageConfigCode | string, string>;

type UploadFileToStorageParams = {
  subdomain: string;
  filePath: string;
  fileName: string;
  mimetype: string;
  forcePrivate?: boolean;
};

const parseBoolean = (value?: string | boolean) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (!value) {
    return false;
  }

  return value.toString().toLowerCase() === 'true';
};

const readConfigValue = (
  configs: StorageConfigMap,
  code: StorageConfigCode,
  defaultValue = '',
) => {
  return configs[code] ?? getEnv({ name: code, defaultValue });
};

const requireConfigValue = (
  configs: StorageConfigMap,
  code: StorageConfigCode,
): string => {
  const value = readConfigValue(configs, code);

  if (!value) {
    throw new Error(`${code} is not configured`);
  }

  return value;
};

const fetchStorageConfigs = async (
  subdomain: string,
): Promise<StorageConfigMap> => {
  const configs =
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'configs',
      action: 'getConfigs',
      method: 'query',
      input: { codes: STORAGE_CONFIG_CODES },
      defaultValue: {},
    })) || {};

  return configs;
};

const isValidPath = (filepath: string): boolean => {
  const resolved = path.resolve(filepath);
  const tempDir = path.resolve(tmpdir());
  return resolved.startsWith(tempDir);
};

const createAwsClient = (configs: StorageConfigMap) => {
  const accessKeyId = requireConfigValue(configs, 'AWS_ACCESS_KEY_ID');
  const secretAccessKey = requireConfigValue(configs, 'AWS_SECRET_ACCESS_KEY');

  const clientConfig: AWS.S3.ClientConfiguration = {
    accessKeyId,
    secretAccessKey,
  };

  const endpoint = readConfigValue(
    configs,
    'AWS_COMPATIBLE_SERVICE_ENDPOINT',
    '',
  );
  const forcePathStyle = readConfigValue(configs, 'AWS_FORCE_PATH_STYLE', '');
  const region = readConfigValue(configs, 'AWS_REGION', '');

  if (endpoint) {
    clientConfig.endpoint = endpoint;
  }

  if (parseBoolean(forcePathStyle)) {
    clientConfig.s3ForcePathStyle = true;
  }

  if (region) {
    clientConfig.region = region;
  }

  return new AWS.S3(clientConfig);
};

const createCloudflareR2Client = (configs: StorageConfigMap) => {
  const accountId = requireConfigValue(configs, 'CLOUDFLARE_ACCOUNT_ID');
  const accessKeyId = requireConfigValue(configs, 'CLOUDFLARE_ACCESS_KEY_ID');
  const secretAccessKey = requireConfigValue(
    configs,
    'CLOUDFLARE_SECRET_ACCESS_KEY',
  );

  return new AWS.S3({
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4',
    region: 'auto',
  });
};

const uploadToCFImages = async (
  filePath: string,
  fileName: string,
  configs: StorageConfigMap,
  forcePrivate?: boolean,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(fileName);

  if (!isValidPath(filePath)) {
    throw new Error('Unsafe file path');
  }

  const accountId = requireConfigValue(configs, 'CLOUDFLARE_ACCOUNT_ID');
  const apiToken = requireConfigValue(configs, 'CLOUDFLARE_API_TOKEN');
  const bucketName = requireConfigValue(configs, 'CLOUDFLARE_BUCKET_NAME');

  const isPublic = forcePrivate
    ? false
    : parseBoolean(readConfigValue(configs, 'FILE_SYSTEM_PUBLIC', 'false'));

  const version = getEnv({ name: 'VERSION' });

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
  const headers = {
    Authorization: `Bearer ${apiToken}`,
  };

  let finalFileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  const extension = finalFileName.split('.').pop();

  if (extension && ['JPEG', 'JPG', 'PNG'].includes(extension)) {
    const baseName = finalFileName.slice(0, -(extension.length + 1));
    finalFileName = `${baseName}.${extension.toLowerCase()}`;
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('id', `${bucketName}/${finalFileName}`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  if (data.result.variants.length === 0) {
    throw new Error('Error uploading file to Cloudflare Images - no variants');
  }

  if (!isPublic || version === 'saas') {
    return `${bucketName}/${finalFileName}`;
  }

  return data.result.variants[0];
};

const uploadToCFStream = async (
  filePath: string,
  fileName: string,
  configs: StorageConfigMap,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(fileName);

  if (!isValidPath(filePath)) {
    throw new Error('Unsafe file path');
  }

  const accountId = requireConfigValue(configs, 'CLOUDFLARE_ACCOUNT_ID');
  const apiToken = requireConfigValue(configs, 'CLOUDFLARE_API_TOKEN');

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;
  const headers = {
    Authorization: `Bearer ${apiToken}`,
  };

  const finalFileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('id', finalFileName);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error('Error uploading file to Cloudflare Stream');
  }

  return data.result.playback.hls;
};

const uploadToAzure = async (
  filePath: string,
  fileName: string,
  mimetype: string,
  configs: StorageConfigMap,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(fileName);

  if (!isValidPath(filePath)) {
    throw new Error('Unsafe file path');
  }

  const isPublic = parseBoolean(
    readConfigValue(configs, 'FILE_SYSTEM_PUBLIC', 'true'),
  );

  const connectionString = requireConfigValue(
    configs,
    'AZURE_STORAGE_CONNECTION_STRING',
  );
  const container = requireConfigValue(configs, 'AZURE_STORAGE_CONTAINER');

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(container);

  const finalFileName = `${randomAlphanumeric()}${sanitizedFilename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(finalFileName);

  const response = await blockBlobClient.uploadFile(filePath, {
    blobHTTPHeaders: { blobContentType: mimetype },
  });

  if (!response) {
    throw new Error('Error uploading file to Azure Blob Storage');
  }

  return isPublic ? blockBlobClient.url : finalFileName;
};

const uploadToAWS = async (
  filePath: string,
  fileName: string,
  mimetype: string,
  configs: StorageConfigMap,
  forcePrivate?: boolean,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(fileName);

  if (!isValidPath(filePath)) {
    throw new Error('Unsafe file path');
  }

  const isPublic = forcePrivate
    ? false
    : parseBoolean(readConfigValue(configs, 'FILE_SYSTEM_PUBLIC', 'true'));

  const awsPrefix = readConfigValue(configs, 'AWS_PREFIX', '');
  const bucket = requireConfigValue(configs, 'AWS_BUCKET');

  const s3 = createAwsClient(configs);
  const finalFileName = `${awsPrefix}${randomAlphanumeric()}${sanitizedFilename}`;
  const buffer = await fs.promises.readFile(filePath);

  const response: any = await new Promise((resolve, reject) => {
    s3.upload(
      {
        ContentType: mimetype,
        Bucket: bucket,
        Key: finalFileName,
        Body: buffer,
        ACL: isPublic ? 'public-read' : undefined,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      },
    );
  });

  return isPublic ? response.Location : finalFileName;
};

const uploadToGCS = async (
  filePath: string,
  fileName: string,
  mimetype: string,
  configs: StorageConfigMap,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(fileName);

  if (!isValidPath(filePath)) {
    throw new Error('Unsafe file path');
  }

  const bucket = requireConfigValue(configs, 'GOOGLE_CLOUD_STORAGE_BUCKET');
  const projectId = requireConfigValue(configs, 'GOOGLE_PROJECT_ID');
  const credentialsPath = requireConfigValue(
    configs,
    'GOOGLE_APPLICATION_CREDENTIALS',
  );

  const isPublic = parseBoolean(
    readConfigValue(configs, 'FILE_SYSTEM_PUBLIC', ''),
  );

  const storage = new Storage({
    projectId,
    keyFilename: credentialsPath,
  });

  const bucketClient = storage.bucket(bucket);
  const finalFileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  const response: any = await new Promise((resolve, reject) => {
    bucketClient.upload(
      filePath,
      {
        metadata: { contentType: mimetype },
        public: isPublic,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        if (res) {
          return resolve(res);
        }
      },
    );
  });

  const { metadata, name } = response;

  return isPublic ? metadata.mediaLink : name;
};

const uploadToCloudflare = async (
  filePath: string,
  fileName: string,
  mimetype: string,
  configs: StorageConfigMap,
  forcePrivate?: boolean,
): Promise<string> => {
  const isPublic = forcePrivate
    ? false
    : parseBoolean(readConfigValue(configs, 'FILE_SYSTEM_PUBLIC', 'false'));

  const sanitizedFilename = sanitizeFilename(fileName);

  if (!isValidPath(filePath)) {
    throw new Error('Unsafe file path');
  }

  const bucketName = requireConfigValue(configs, 'CLOUDFLARE_BUCKET_NAME');
  const useCdn = parseBoolean(
    readConfigValue(configs, 'CLOUDFLARE_USE_CDN', ''),
  );

  const detectedType = { mime: mimetype };

  let adjustedFileName = fileName;
  if (path.extname(fileName).toLowerCase() === '.jfif') {
    adjustedFileName = fileName.replace('.jfif', '.jpeg');
  }

  if (
    useCdn &&
    detectedType &&
    isImage(detectedType.mime) &&
    ![
      'image/heic',
      'image/heif',
      'image/x-icon',
      'image/vnd.microsoft.icon',
    ].includes(detectedType.mime)
  ) {
    return uploadToCFImages(filePath, adjustedFileName, configs, forcePrivate);
  }

  if (useCdn && detectedType && isVideo(detectedType.mime)) {
    return uploadToCFStream(filePath, adjustedFileName, configs);
  }

  const finalFileName = `${randomAlphanumeric()}${sanitizedFilename}`;
  const buffer = await fs.promises.readFile(filePath);
  const r2 = createCloudflareR2Client(configs);

  const response: any = await new Promise((resolve, reject) => {
    r2.upload(
      {
        ContentType: mimetype,
        Bucket: bucketName,
        Key: finalFileName,
        Body: buffer,
        ACL: isPublic ? 'public-read' : undefined,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      },
    );
  });

  return isPublic ? response.Location : finalFileName;
};

export const uploadFileToStorage = async ({
  subdomain,
  filePath,
  fileName,
  mimetype,
  forcePrivate = false,
}: UploadFileToStorageParams): Promise<string> => {
  const configs = await fetchStorageConfigs(subdomain);
  const uploadType = readConfigValue(
    configs,
    'UPLOAD_SERVICE_TYPE',
    'AWS',
  ).toUpperCase();

  const version = getEnv({ name: 'VERSION' });
  const shouldForcePrivate = forcePrivate || version === 'saas';

  if (uploadType === 'GCS') {
    return await uploadToGCS(filePath, fileName, mimetype, configs);
  }

  if (uploadType === 'AWS') {
    return await uploadToAWS(
      filePath,
      fileName,
      mimetype,
      configs,
      shouldForcePrivate,
    );
  }

  if (uploadType === 'CLOUDFLARE') {
    return await uploadToCloudflare(
      filePath,
      fileName,
      mimetype,
      configs,
      shouldForcePrivate,
    );
  }

  if (uploadType === 'AZURE') {
    return await uploadToAzure(filePath, fileName, mimetype, configs);
  }

  if (uploadType === 'LOCAL') {
    throw new Error(
      'Local storage cannot be accessed from shared utilities. Use server-side file upload instead.',
    );
  }

  throw new Error(
    `Unsupported upload service type "${uploadType}" while uploading "${fileName}"`,
  );
};
