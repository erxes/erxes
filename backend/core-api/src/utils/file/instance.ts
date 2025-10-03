import * as AWS from 'aws-sdk';
import * as path from 'path';
import { IModels } from '~/connectionResolvers';
import {
  getConfig,
  getFileUploadConfigs,
} from '~/modules/organization/settings/utils/configs';

const privateUploadsPath = path.join(__dirname, '../private/uploads');

export const uploadsFolderPath = path.resolve(privateUploadsPath);

/**
 * Create Azure Blob Storage instance
 */
export const createAzureBlobStorage = async (models?: IModels) => {
  const AZURE_STORAGE_CONNECTION_STRING = await getConfig(
    'AZURE_STORAGE_CONNECTION_STRING',
    '',
    models,
  );
  const AZURE_STORAGE_CONTAINER = await getConfig(
    'AZURE_STORAGE_CONTAINER',
    '',
    models,
  );

  if (!AZURE_STORAGE_CONNECTION_STRING || !AZURE_STORAGE_CONTAINER) {
    throw new Error('Azure Blob Storage credentials are not configured');
  }

  const { BlobServiceClient } = require('@azure/storage-blob');

  // Initialize Azure Blob Storage
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING,
  );

  // return a specific container client
  return blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
};

/**
 * Create AWS instance
 */
export const createAWS = async (models?: IModels) => {
  const AWS_ACCESS_KEY_ID = await getConfig('AWS_ACCESS_KEY_ID', '', models);
  const AWS_SECRET_ACCESS_KEY = await getConfig(
    'AWS_SECRET_ACCESS_KEY',
    '',
    models,
  );
  const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);
  const AWS_COMPATIBLE_SERVICE_ENDPOINT = await getConfig(
    'AWS_COMPATIBLE_SERVICE_ENDPOINT',
    '',
    models,
  );
  const AWS_FORCE_PATH_STYLE = await getConfig(
    'AWS_FORCE_PATH_STYLE',
    '',
    models,
  );

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET) {
    throw new Error('AWS credentials are not configured');
  }

  const options: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    s3ForcePathStyle?: boolean;
    region?: string;
  } = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  };

  if (AWS_FORCE_PATH_STYLE === 'true') {
    options.s3ForcePathStyle = true;
  }

  if (AWS_COMPATIBLE_SERVICE_ENDPOINT) {
    options.endpoint = AWS_COMPATIBLE_SERVICE_ENDPOINT;
  }

  const AWS_REGION = await getConfig('AWS_REGION', '', models);

  if (AWS_REGION) {
    options.region = AWS_REGION;
  }

  // initialize s3
  return new AWS.S3(options);
};

/**
 * Create Google Cloud Storage instance
 */
export const createGCS = async (models?: IModels) => {
  const GOOGLE_APPLICATION_CREDENTIALS = await getConfig(
    'GOOGLE_APPLICATION_CREDENTIALS',
    '',
    models,
  );
  const GOOGLE_PROJECT_ID = await getConfig('GOOGLE_PROJECT_ID', '', models);
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET', '', models);

  if (!GOOGLE_PROJECT_ID || !GOOGLE_APPLICATION_CREDENTIALS || !BUCKET) {
    throw new Error('Google Cloud Storage credentials are not configured');
  }

  const { Storage } = require('@google-cloud/storage');

  // initializing Google Cloud Storage
  return new Storage({
    projectId: GOOGLE_PROJECT_ID,
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  });
};

/*
 * Create Cloudflare R2 instance
 */
export const createCFR2 = async (models?: IModels) => {
  const {
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY,
  } = await getFileUploadConfigs(models);

  const CLOUDFLARE_ENDPOINT = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  if (!CLOUDFLARE_ACCESS_KEY_ID || !CLOUDFLARE_SECRET_ACCESS_KEY) {
    throw new Error('Cloudflare Credentials are not configured');
  }

  const options: {
    endpoint?: string;
    accessKeyId: string;
    secretAccessKey: string;
    signatureVersion: 'v4';
    region: string;
  } = {
    endpoint: CLOUDFLARE_ENDPOINT,
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'auto',
  };

  return new AWS.S3(options);
};
