import {
  getEnv,
  isImage,
  isVideo,
  randomAlphanumeric,
  sanitizeFilename,
} from 'erxes-api-shared/utils';
import { fileTypeFromBuffer } from 'file-type/core';
import FormData from 'form-data';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import { IModels } from '~/connectionResolvers';
import {
  getConfig,
  getFileUploadConfigs,
} from '~/modules/organization/settings/utils/configs';
import { isValidPath } from '.';
import {
  createAWS,
  createAzureBlobStorage,
  createCFR2,
  createGCS,
  uploadsFolderPath,
} from './instance';

/*
 * Save file to Cloudflare
 */

export const uploadToCFImages = async (
  file: any,
  forcePrivate?: boolean,
  models?: IModels,
) => {
  const sanitizedFilename = sanitizeFilename(file.originalFilename);

  if (!isValidPath(file.filepath)) {
    throw new Error('Unsafe file path');
  }

  const {
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_BUCKET_NAME,
  } = await getFileUploadConfigs(models);

  const IS_PUBLIC = forcePrivate
    ? false
    : await getConfig('FILE_SYSTEM_PUBLIC', 'false', models);

  const VERSION = getEnv({ name: 'VERSION' });

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;
  const headers = {
    Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
  };

  let fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  const extension = fileName.split('.').pop();

  if (extension && ['JPEG', 'JPG', 'PNG'].includes(extension)) {
    const baseName = fileName.slice(0, -(extension.length + 1));

    fileName = `${baseName}.${extension.toLowerCase()}`;
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(file.filepath));
  formData.append('id', `${CLOUDFLARE_BUCKET_NAME}/${fileName}`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error('Error uploading file to Cloudflare Images 1');
  }

  if (data.result.variants.length === 0) {
    throw new Error('Error uploading file to Cloudflare Images 2');
  }

  if (!IS_PUBLIC || IS_PUBLIC === 'false' || VERSION === 'saas') {
    return CLOUDFLARE_BUCKET_NAME + '/' + fileName;
  }

  return data.result.variants[0];
};

/*
 * Save file to Cloudflare stream
 */
const uploadToCFStream = async (file: any, models?: IModels) => {
  const sanitizedFilename = sanitizeFilename(file.originalFilename);

  if (!isValidPath(file.filepath)) {
    throw new Error('Unsafe file path');
  }

  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } =
    await getFileUploadConfigs(models);

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;
  const headers = {
    Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
  };

  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  const formData = new FormData();
  formData.append('file', fs.createReadStream(file.filepath));
  formData.append('id', fileName);

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

/*
 * Save file to azure blob storage
 */
export const uploadFileAzure = async (
  file: {
    originalFilename: string;
    filepath: string;
    mimetype: string;
  },
  models: IModels,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(file.originalFilename);

  if (!isValidPath(file.filepath)) {
    throw new Error('Unsafe file path');
  }

  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC', 'true', models);

  // initialize Azure Blob Storage
  const containerClient = await createAzureBlobStorage(models);

  // generate unique name
  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  // Create a block blob for the file
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  // Upload data to the blob
  const response = await blockBlobClient.uploadFile(file.filepath, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  if (!response) {
    throw new Error('Error uploading file to Azure Blob Storage');
  }

  // Return either the blob's URL or its name, depending on public status
  return IS_PUBLIC === 'true' ? blockBlobClient.url : fileName;
};

/*
 * Save binary data to amazon s3
 */
export const uploadFileAWS = async (
  file: {
    originalFilename: string;
    filepath: string;
    mimetype: string;
  },
  forcePrivate = false,
  models?: IModels,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(file.originalFilename);

  if (!isValidPath(file.filepath)) {
    throw new Error('Unsafe file path');
  }

  const IS_PUBLIC = forcePrivate
    ? false
    : await getConfig('FILE_SYSTEM_PUBLIC', 'true', models);
  const AWS_PREFIX = await getConfig('AWS_PREFIX', '', models);
  const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);

  // initialize s3
  const s3 = await createAWS(models);

  // generate unique name

  const fileName = `${AWS_PREFIX}${randomAlphanumeric()}${sanitizedFilename}`;

  // read file
  const buffer = await fs.promises.readFile(file.filepath);

  // upload to s3
  const response: any = await new Promise((resolve, reject) => {
    s3.upload(
      {
        ContentType: file.mimetype,
        Bucket: AWS_BUCKET,
        Key: fileName,
        Body: buffer,
        ACL: IS_PUBLIC === 'true' ? 'public-read' : undefined,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      },
    );
  });

  return IS_PUBLIC === 'true' ? response.Location : fileName;
};

/*
 * Save file to google cloud storage
 */
export const uploadFileGCS = async (
  file: {
    originalFilename: string;
    filepath: string;
    mimetype: string;
  },
  models: IModels,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(file.originalFilename);

  if (!isValidPath(file.filepath)) {
    throw new Error('Unsafe file path');
  }

  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET', '', models);
  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC', '', models);

  // initialize GCS
  const storage = await createGCS(models);

  // select bucket
  const bucket = storage.bucket(BUCKET);

  // generate unique name
  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  bucket.file(fileName);

  const response: any = await new Promise((resolve, reject) => {
    bucket.upload(
      file.filepath,
      {
        metadata: { contentType: file.mimetype },
        public: IS_PUBLIC === 'true',
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

  return IS_PUBLIC === 'true' ? metadata.mediaLink : name;
};

/*
 * Save file to Cloudflare
 */

export const uploadFileCloudflare = async (
  file: {
    originalFilename: string;
    filepath: string;
    mimetype: string;
  },
  forcePrivate = false,
  models?: IModels,
): Promise<string> => {
  const IS_PUBLIC = forcePrivate
    ? false
    : await getConfig('FILE_SYSTEM_PUBLIC', 'false');

  const sanitizedFilename = sanitizeFilename(file.originalFilename);
  if (!isValidPath(file.filepath)) {
    throw new Error('Unsafe file path');
  }

  const { CLOUDFLARE_BUCKET_NAME, CLOUDFLARE_USE_CDN } =
    await getFileUploadConfigs(models);

  const detectedType = await fileTypeFromBuffer(fs.readFileSync(file.filepath));

  if (path.extname(file.originalFilename).toLowerCase() === `.jfif`) {
    file.originalFilename = file.originalFilename.replace('.jfif', '.jpeg');
  }

  if (
    (CLOUDFLARE_USE_CDN === 'true' || CLOUDFLARE_USE_CDN === true) &&
    detectedType &&
    isImage(detectedType.mime) &&
    ![
      'image/heic',
      'image/heif',
      'image/x-icon',
      'image/vnd.microsoft.icon',
    ].includes(detectedType.mime)
  ) {
    console.debug('uploading to cf images');
    return uploadToCFImages(file, forcePrivate, models);
  }

  if (
    (CLOUDFLARE_USE_CDN === 'true' || CLOUDFLARE_USE_CDN === true) &&
    detectedType &&
    isVideo(detectedType.mime)
  ) {
    return uploadToCFStream(file, models);
  }

  // generate unique name
  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  // read file
  const buffer = await fs.promises.readFile(file.filepath);

  // initialize r2
  const r2 = await createCFR2(models);

  // upload to r2

  const response: any = await new Promise((resolve, reject) => {
    r2.upload(
      {
        ContentType: file.mimetype,
        Bucket: CLOUDFLARE_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ACL: IS_PUBLIC === 'true' ? 'public-read' : undefined,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      },
    );
  });
  return IS_PUBLIC === 'true' ? response.Location : fileName;
};

/*
 * Save file to local disk
 */
export const uploadFileLocal = async (file: {
  originalFilename: string;
  filepath: string;
  mimetype: string;
}): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(file.originalFilename);

  if (!isValidPath(file.filepath)) {
    throw new Error('Unsafe file path');
  }

  const oldPath = file.filepath;

  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath);
  }

  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;
  const newPath = `${uploadsFolderPath}/${fileName}`;
  const rawData = fs.readFileSync(oldPath);

  return new Promise((resolve, reject) => {
    fs.writeFile(newPath, rawData, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(fileName);
    });
  });
};

/*
 * Save binary data to amazon s3
 */
export const uploadFile = async (
  apiUrl: string,
  file,
  fromEditor = false,
  models: IModels,
): Promise<any> => {
  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC', '', models);
  const VERSION = getEnv({ name: 'VERSION' });

  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs(models);
  let nameOrLink = '';

  if (UPLOAD_SERVICE_TYPE === 'AZURE') {
    nameOrLink = await uploadFileAzure(file, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    nameOrLink = await uploadFileAWS(file, false, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    nameOrLink = await uploadFileGCS(file, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'CLOUDFLARE') {
    nameOrLink = await uploadFileCloudflare(
      file,
      !!(VERSION === 'saas'),
      models,
    );
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    nameOrLink = await uploadFileLocal(file);
  }

  if (fromEditor) {
    const editorResult = {
      fileName: file.originalFilename,
      uploaded: 1,
      url: nameOrLink,
    };

    if (IS_PUBLIC !== 'true') {
      editorResult.url = `${apiUrl}/read-file?key=${nameOrLink}`;
    }

    return editorResult;
  }

  return nameOrLink;
};
