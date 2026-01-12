import { BlobServiceClient } from '@azure/storage-blob';
import { Storage } from '@google-cloud/storage';
import AWS from 'aws-sdk';
import fetch from 'node-fetch';
import { sendTRPCMessage } from '../trpc';
import { getEnv, isImage } from '../utils';

const STORAGE_CONFIG_CODES = [
  'UPLOAD_SERVICE_TYPE',
  'AWS_BUCKET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_COMPATIBLE_SERVICE_ENDPOINT',
  'AWS_FORCE_PATH_STYLE',
  'AWS_REGION',
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
] as const;

type StorageConfigCode = (typeof STORAGE_CONFIG_CODES)[number];
type StorageConfigMap = Record<StorageConfigCode | string, string>;

type ReadRemoteFileParams = {
  subdomain: string;
  key: string;
  width?: number;
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

const azureStreamToBuffer = (
  stream: NodeJS.ReadableStream,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(Uint8Array.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
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

const readFromGCS = async (key: string, configs: StorageConfigMap) => {
  const bucket = requireConfigValue(configs, 'GOOGLE_CLOUD_STORAGE_BUCKET');
  const projectId = requireConfigValue(configs, 'GOOGLE_PROJECT_ID');
  const credentialsPath = requireConfigValue(
    configs,
    'GOOGLE_APPLICATION_CREDENTIALS',
  );

  const storage = new Storage({
    projectId,
    keyFilename: credentialsPath,
  });

  const file = storage.bucket(bucket).file(key);
  const [contents] = await file.download({});

  return contents;
};

const readFromAws = async (key: string, configs: StorageConfigMap) => {
  const bucket = requireConfigValue(configs, 'AWS_BUCKET');
  const s3 = createAwsClient(configs);

  return await new Promise<Buffer | null>((resolve, reject) => {
    s3.getObject(
      {
        Bucket: bucket,
        Key: key,
      },
      (error, response) => {
        if (error) {
          if (
            error.code === 'NoSuchKey' &&
            error.message.includes('key does not exist')
          ) {
            console.warn(
              `[readFileFromStorage] S3 key "${key}" was not found in bucket "${bucket}"`,
            );
            return resolve(null);
          }

          return reject(error);
        }

        return resolve(response.Body as Buffer);
      },
    );
  });
};

const readFromCR2 = async (key: string, configs: StorageConfigMap) => {
  const bucket = requireConfigValue(configs, 'CLOUDFLARE_BUCKET_NAME');
  const r2 = createCloudflareR2Client(configs);

  return await new Promise<Buffer | null>((resolve, reject) => {
    r2.getObject(
      {
        Bucket: bucket,
        Key: key,
      },
      (error, response) => {
        if (error) {
          if (
            error.code === 'NoSuchKey' &&
            error.message.includes('key does not exist')
          ) {
            console.warn(
              `[readFileFromStorage] R2 key "${key}" was not found in bucket "${bucket}"`,
            );
            return resolve(null);
          }

          return reject(error);
        }

        return resolve(response.Body as Buffer);
      },
    );
  });
};

const readFromCFImages = async (
  key: string,
  configs: StorageConfigMap,
  width?: number,
) => {
  const bucketName = readConfigValue(configs, 'CLOUDFLARE_BUCKET_NAME', '');
  const accountHash = requireConfigValue(configs, 'CLOUDFLARE_ACCOUNT_HASH');
  const version = getEnv({ name: 'VERSION' });

  let fileName = key;

  if (
    (!version || version !== 'saas') &&
    bucketName &&
    !key.startsWith(bucketName)
  ) {
    fileName = `${bucketName}/${key}`;
  }

  const url = width
    ? `https://imagedelivery.net/${accountHash}/${fileName}/w=${width}`
    : `https://imagedelivery.net/${accountHash}/${fileName}/public`;

  try {
    const response = await fetch(url);
    if (!response.ok || response.status !== 200) {
      return await readFromCR2(key, configs);
    }

    const buffer = await response.buffer();
    return buffer;
  } catch (error) {
    console.warn(
      `[readFileFromStorage] Failed to read from Cloudflare Images: ${
        (error as Error).message
      }`,
    );
    return await readFromCR2(key, configs);
  }
};

const readFromAzure = async (key: string, configs: StorageConfigMap) => {
  const connectionString = requireConfigValue(
    configs,
    'AZURE_STORAGE_CONNECTION_STRING',
  );
  const container = requireConfigValue(configs, 'AZURE_STORAGE_CONTAINER');

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(container);
  const blobClient = containerClient.getBlobClient(key);
  const response = await blobClient.download();

  if (!response.readableStreamBody) {
    throw new Error('Azure blob download did not return a readable stream');
  }

  return await azureStreamToBuffer(response.readableStreamBody);
};

export const readFileFromStorage = async ({
  subdomain,
  key,
  width,
}: ReadRemoteFileParams): Promise<Buffer | null> => {
  const configs = await fetchStorageConfigs(subdomain);
  const uploadType = readConfigValue(
    configs,
    'UPLOAD_SERVICE_TYPE',
    'AWS',
  ).toUpperCase();

  if (uploadType === 'GCS') {
    return await readFromGCS(key, configs);
  }

  if (uploadType === 'AWS') {
    return await readFromAws(key, configs);
  }

  if (uploadType === 'CLOUDFLARE') {
    const useCdn = parseBoolean(
      readConfigValue(configs, 'CLOUDFLARE_USE_CDN', ''),
    );

    if (useCdn && isImage(key)) {
      return await readFromCFImages(key, configs, width);
    }

    return await readFromCR2(key, configs);
  }

  if (uploadType === 'AZURE') {
    return await readFromAzure(key, configs);
  }

  if (uploadType === 'LOCAL') {
    throw new Error(
      'Local storage cannot be accessed from shared utilities. Use server-side file reader instead.',
    );
  }

  throw new Error(
    `Unsupported upload service type "${uploadType}" while reading "${key}"`,
  );
};
