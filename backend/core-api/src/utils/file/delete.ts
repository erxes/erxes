import * as fs from 'fs';
import { IModels } from '~/connectionResolvers';
import {
  getConfig,
  getFileUploadConfigs,
} from '~/modules/organization/settings/utils/configs';
import {
  createAWS,
  createAzureBlobStorage,
  createCFR2,
  createGCS,
  uploadsFolderPath,
} from './instance';

/*
 * Delete file from amazon s3
 */
export const deleteFileAWS = async (fileName: string, models?: IModels) => {
  const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);

  const params = { Bucket: AWS_BUCKET, Key: fileName };

  // initialize s3
  const s3 = await createAWS(models);

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve('ok');
    });
  });
};

/*
 * Delete file from GCS
 */
const deleteFileGCS = async (fileName: string, models?: IModels) => {
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET', '', models);

  // initialize GCS
  const storage = await createGCS(models);

  // select bucket
  const bucket = storage.bucket(BUCKET);

  return new Promise((resolve, reject) => {
    bucket
      .file(fileName)
      .delete()
      .then(() => {
        return resolve('ok');
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

/*
 * Delete file from Cloudflare
 */
export const deleteFileCloudflare = async (
  fileName: string,
  models?: IModels,
) => {
  const { CLOUDFLARE_BUCKET_NAME } = await getFileUploadConfigs(models);

  const params = { Bucket: CLOUDFLARE_BUCKET_NAME, Key: fileName };

  // initialize r2
  const r2 = await createCFR2(models);

  return new Promise((resolve, reject) => {
    r2.deleteObject(params, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve('ok');
    });
  });
};

/*
 * Delete file from Azure storage
 */
export const deleteFileAzure = async (fileName: string, models?: IModels) => {
  // Initialize the Azure Blob container client
  const containerClient = await createAzureBlobStorage(models); // Assuming this function provides a container client

  // Get the blob client for the specified file key
  const blobClient = containerClient.getBlobClient(fileName);

  return new Promise((resolve, reject) => {
    blobClient
      .delete()
      .then(() => {
        return resolve('ok');
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

/*
 * Delete file from local
 */
const deleteFileLocal = async (fileName: string) => {
  return new Promise((resolve, reject) => {
    fs.unlink(`${uploadsFolderPath}/${fileName}`, (error) => {
      if (error) {
        return reject(error);
      }

      return resolve('ok');
    });
  });
};

export const deleteFile = async (
  models: IModels,
  fileName: string,
): Promise<any> => {
  const UPLOAD_SERVICE_TYPE = await getConfig(
    'UPLOAD_SERVICE_TYPE',
    'AWS',
    models,
  );

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    return deleteFileAWS(fileName, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    return deleteFileGCS(fileName, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'CLOUDFLARE') {
    return deleteFileCloudflare(fileName, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'AZURE') {
    return deleteFileAzure(fileName, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    return deleteFileLocal(fileName);
  }
};
