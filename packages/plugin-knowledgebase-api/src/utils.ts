import { getEnv } from '@erxes/api-utils/src/core';
import { can, checkLogin } from '@erxes/api-utils/src/permissions';
import { IUserDocument } from '@erxes/api-utils/src/types';

import * as AWS from 'aws-sdk';
import * as FormData from 'form-data';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import * as tmp from 'tmp';

import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import sanitizeFilename from '@erxes/api-utils/src/sanitize-filename';
import { execSync } from 'child_process';
import { generateModels, IModels } from './connectionResolver';
import { ICFConfig } from './models/Configs';

export const getValueAsString = async (
  models: IModels,
  name: string,
  envKey: string,
  defaultValue?: string
) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    return getEnv({ name: envKey, defaultValue });
  }

  const entry = await models.Configs.getConfig(name);

  if (entry.value) {
    return entry.value.toString();
  }

  return entry.value;
};

export const getConfigs = async (models: IModels): Promise<any> => {
  const configsMap = {};
  const configs = await models.Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (models: IModels, code, defaultValue?) => {
  const configs = await getConfigs(models);

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

const createCFR2 = async (configs: ICFConfig) => {
  const { accessKeyId, secretAccessKey } = configs;
  const CLOUDFLARE_ENDPOINT = `https://${configs.accountId}.r2.cloudflarestorage.com`;

  if (!accessKeyId.length || !secretAccessKey.length) {
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
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4',
    region: 'auto',
  };

  return new AWS.S3(options);
};


export const checkPermission = async (
  subdomain: string,
  user: IUserDocument,
  mutationName: string
) => {
  checkLogin(user);

  const permissions = ['manageKnowledgeBase'];

  const actionName = permissions.find(
    (permission) => permission === mutationName
  );

  if (!actionName) {
    throw new Error('Permission required');
  }

  let allowed = await can(subdomain, actionName, user);

  if (user.isOwner) {
    allowed = true;
  }

  if (!allowed) {
    throw new Error('Permission required');
  }

  return;
};

export const handleUpload = async (subdomain: string, file: any) => {
  const models = await generateModels(subdomain);
  await validateCloudflareConfig(models);
  const configs = await models.Configs.getCloudflareConfigs();

  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  try {
    const pdfUrl = await uploadFileCloudflare(file, configs);
    const imageUrls = await convertAndUploadImages(
      file.path,
      tmpDir.name,
      configs
    );

    return { pdf: pdfUrl, pages: imageUrls };
  } finally {
    fs.unlinkSync(file.path);
    tmp.setGracefulCleanup();
  }
};

async function validateCloudflareConfig(models: IModels) {
  const serviceType = await getValueAsString(
    models,
    'UPLOAD_SERVICE_TYPE',
    'UPLOAD_SERVICE_TYPE'
  );
  if (serviceType !== 'CLOUDFLARE') {
    throw new Error('Cloudflare not configured');
  }
}

async function convertAndUploadImages(
  pdfPath: string,
  tmpDir: string,
  configs: ICFConfig
) {
  const imagePaths = await convertPdfToPng(pdfPath, tmpDir);
  if (!imagePaths.length) {
    throw new Error('No images found');
  }

  const uploadImage =
    configs.useCdn === 'true' ? uploadToCFImages : uploadFileCloudflare;
  return Promise.all(
    imagePaths.map((imagePath) => uploadImage(imagePath, configs))
  );
}

export const uploadFileCloudflare = async (
  file: any,
  configs: ICFConfig
): Promise<string> => {
  const fileObj = file;

  const sanitizedFilename = sanitizeFilename(fileObj.filename);

  if (path.extname(fileObj.filename).toLowerCase() === `.jfif`) {
    fileObj.filename = fileObj.filename.replace('.jfif', '.jpeg');
  }

  // generate unique name
  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  // read fileObj
  const buffer = await fs.readFileSync(fileObj.path);

  // initialize r2
  const r2 = await createCFR2(configs);

  // upload to r2

  try {
    const response = await r2
      .upload({
        ContentType: fileObj.type,
        Bucket: configs.bucket,
        Key: fileName,
        Body: buffer,
        ACL: configs.isPublic === 'true' ? 'public-read' : undefined,
      })
      .promise();
    return configs.isPublic === 'true' ? response.Location : fileName;
  } catch (err) {
    throw new Error('Failed to upload to R2: ' + err.message);
  }
};

const uploadToCFImages = async (file: any, configs: ICFConfig) => {
  const sanitizedFilename = sanitizeFilename(file.filename);
  const { isPublic, accountId, apiToken, bucket } = configs;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

  let fileName = `${randomAlphanumeric()}${sanitizedFilename}`;
  const extension = fileName.split('.').pop();

  if (extension && ['JPEG', 'JPG', 'PNG'].includes(extension)) {
    const baseName = fileName.slice(0, -(extension.length + 1));
    fileName = `${baseName}.${extension.toLowerCase()}`;
  }

  if (!fs.existsSync(file.path)) {
    console.error(`File not found: ${file.path}`);
    throw new Error('File not found');
  }

  const formData = new FormData();

  formData.append('file', fs.createReadStream(file.path));

  formData.append('id', `${bucket}/${fileName}`);

  const headers = {
    Authorization: `Bearer ${apiToken}`,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data: any = await response.json();

  if (!data.success) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  if (data.result.variants.length === 0) {
    throw new Error('Error uploading file to Cloudflare Images');
  }

  return isPublic && isPublic !== 'false'
    ? data.result.variants[0]
    : `${bucket}/${fileName}`;
};

const convertPdfToPng = async (pdfFilePath: string, directory: string) => {
  const options = {
    format: 'jpeg',
    out_dir: directory, 
    out_prefix: 'page', 
    page: null,
  };

  try {
    // Convert PDF to images (Poppler automatically handles this)
    execSync(
      `pdftoppm -jpeg -r 150 ${pdfFilePath} ${path.join(
        options.out_dir,
        options.out_prefix
      )}`
    );
    // Collect all images from the directory
    return fs.readdirSync(directory).map((fileName) => ({
      type: 'image/jpeg',
      filename: fileName,
      originalname: fileName,
      encoding: '7bit',
      path: `${directory}/${fileName}`,
      size: fs.statSync(`${directory}/${fileName}`).size,
      mimetype: 'image/jpeg',
      destination: directory,
    }));
  } catch (error) {
    console.error('Error during PDF to image conversion:', error);
    throw error;
  }
};
