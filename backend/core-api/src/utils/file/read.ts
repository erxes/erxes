import { getEnv, isImage } from 'erxes-api-shared/utils';
import * as fs from 'fs';
import fetch from 'node-fetch';
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

/**
 * Read file from GCS, AWS
 */

const readFromCFImages = async (
  key: string,
  width?: number,
  models?: IModels,
) => {
  const VERSION = getEnv({ name: 'VERSION' });

  const { CLOUDFLARE_BUCKET_NAME, CLOUDFLARE_ACCOUNT_HASH } =
    await getFileUploadConfigs(models);

  let fileName = key;

  if (
    (!VERSION || VERSION !== 'saas') &&
    !key.startsWith(CLOUDFLARE_BUCKET_NAME)
  ) {
    fileName = `${CLOUDFLARE_BUCKET_NAME}/${key}`;
  }

  if (!CLOUDFLARE_ACCOUNT_HASH) {
    throw new Error('Cloudflare Account Hash is not configured');
  }

  let url = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${fileName}/public`;

  if (width) {
    url = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${fileName}/w=${width}`;
  }

  return new Promise((resolve) => {
    fetch(url)
      .then((res) => {
        if (!res.ok || res.status !== 200) {
          return readFromCR2(key, models);
        }
        return res.buffer();
      })
      .then((buffer) => resolve(buffer))
      .catch(() => {
        return readFromCR2(key, models);
      });
  });
};

const readFromCR2 = async (key: string, models?: IModels) => {
  const { CLOUDFLARE_BUCKET_NAME } = await getFileUploadConfigs(models);

  const r2 = await createCFR2(models);

  return new Promise((resolve, reject) => {
    r2.getObject(
      {
        Bucket: CLOUDFLARE_BUCKET_NAME,
        Key: key,
      },
      (error, response) => {
        if (error) {
          if (
            error.code === 'NoSuchKey' &&
            error.message.includes('key does not exist')
          ) {
            console.error('file does not exist with key: ', key);

            return resolve(null);
          }

          return reject(error);
        }

        return resolve(response.Body);
      },
    );
  });
};

/**
 * Converts a readable stream from Azure Blob Storage into a Buffer.
 *
 * @param {NodeJS.ReadableStream} stream - The readable stream from Azure Blob Storage.
 * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the stream data.
 */
const azureStreamToBuffer = (
  stream: NodeJS.ReadableStream,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

export const readFileRequest = async ({
  key,
  models,
  width,
}: {
  key: string;
  models?: IModels;
  width?: number;
}): Promise<any> => {
  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs(models);

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    const GCS_BUCKET = await getConfig(
      'GOOGLE_CLOUD_STORAGE_BUCKET',
      '',
      models,
    );
    const storage = await createGCS(models);

    const bucket = storage.bucket(GCS_BUCKET);

    const file = bucket.file(key);

    // get a file buffer
    const [contents] = await file.download({});

    return contents;
  }

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);
    const s3 = await createAWS(models);

    return new Promise((resolve, reject) => {
      s3.getObject(
        {
          Bucket: AWS_BUCKET,
          Key: key,
        },
        (error, response) => {
          if (error) {
            if (
              error.code === 'NoSuchKey' &&
              error.message.includes('key does not exist')
            ) {
              console.log(
                `Error occurred when fetching s3 file with key: "${key}"`,
              );
              //   debugBase(
              //     `Error occurred when fetching s3 file with key: "${key}"`,
              //   );
            }

            return reject(error);
          }

          return resolve(response.Body);
        },
      );
    });
  }

  if (UPLOAD_SERVICE_TYPE === 'CLOUDFLARE') {
    const { CLOUDFLARE_USE_CDN } = await getFileUploadConfigs(models);

    if (
      (CLOUDFLARE_USE_CDN === 'true' || CLOUDFLARE_USE_CDN === true) &&
      isImage(key)
    ) {
      return readFromCFImages(key, width, models);
    }

    return readFromCR2(key, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'AZURE') {
    const containerClient = await createAzureBlobStorage(models);
    const blobClient = containerClient.getBlobClient(key);
    const response = await blobClient.download();

    if (!response.readableStreamBody) {
      throw new Error('No readable stream found in response');
    }

    return azureStreamToBuffer(response.readableStreamBody);
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    return new Promise((resolve, reject) => {
      fs.readFile(`${uploadsFolderPath}/${key}`, (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      });
    });
  }
};
