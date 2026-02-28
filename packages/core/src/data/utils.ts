import utils from '@erxes/api-utils/src';
import { USER_ROLES } from '@erxes/api-utils/src/constants';
import * as AWS from 'aws-sdk';
import * as fileType from 'file-type';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as jimp from 'jimp';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as xlsxPopulate from 'xlsx-populate';
import * as FormData from 'form-data';
import fetch from 'node-fetch';
import { IModels } from '../connectionResolver';
import { IUserDocument } from '../db/models/definitions/users';
import { debugBase, debugError } from '../debuggers';
import { sendCommonMessage } from '../messageBroker';
import { graphqlPubsub } from '../pubsub';
import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';
import redis from '@erxes/api-utils/src/redis';
import sanitizeFilename from '@erxes/api-utils/src/sanitize-filename';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import { isImage } from '@erxes/api-utils/src/commonUtils';

export interface IEmailParams {
  toEmails?: string[];
  fromEmail?: string;
  title?: string;
  customHtml?: string;
  customHtmlData?: any;
  template?: { name?: string; data?: any };
  attachments?: object[];
  modifier?: (data: any, email: string) => void;
  transportMethod?: string;
  getOrganizationDetail?: ({ subdomain }: { subdomain: string }) => any;
}

/**
 * Read contents of a file
 */
export const readFile = async (filename: string) => {
  const filePath = path.resolve(
    __dirname,
    `../private/emailTemplates/${filename}.html`,
  );
  return fs.promises.readFile(filePath, 'utf8');
};

/**
 * Apply template
 */
const applyTemplate = async (data: any, templateName: string) => {
  let template: any = await readFile(templateName);

  template = Handlebars.compile(template.toString());

  return template(data);
};

export const sendEmail = async (
  subdomain: string,
  params: IEmailParams,
  models?: IModels,
) => {
  const {
    toEmails = [],
    fromEmail,
    title,
    customHtml,
    customHtmlData,
    template = {},
    modifier,
    attachments,
    getOrganizationDetail,
    transportMethod,
  } = params;

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const DEFAULT_EMAIL_SERVICE = await getConfig(
    'DEFAULT_EMAIL_SERVICE',
    'SES',
    models,
  );
  const defaultTemplate = await getConfig('COMPANY_EMAIL_TEMPLATE', '', models);
  const defaultTemplateType = await getConfig(
    'COMPANY_EMAIL_TEMPLATE_TYPE',
    '',
    models,
  );
  const COMPANY_EMAIL_FROM = await getConfig('COMPANY_EMAIL_FROM', '', models);
  const AWS_SES_CONFIG_SET = await getConfig('AWS_SES_CONFIG_SET', '', models);
  const AWS_SES_ACCESS_KEY_ID = await getConfig(
    'AWS_SES_ACCESS_KEY_ID',
    '',
    models,
  );
  const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
    'AWS_SES_SECRET_ACCESS_KEY',
    '',
    models,
  );

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  const VERSION = getEnv({ name: 'VERSION' });

  // do not send email it is running in test mode
  if (NODE_ENV === 'test') {
    return;
  }

  // try to create transporter or throw configuration error
  let transporter;
  let sendgridMail;

  try {
    transporter = await createTransporter(
      { ses: DEFAULT_EMAIL_SERVICE === 'SES' },
      models,
    );

    if (transportMethod === 'sendgrid' || (VERSION && VERSION === 'saas')) {
      sendgridMail = require('@sendgrid/mail');

      const SENDGRID_API_KEY = getEnv({ name: 'SENDGRID_API_KEY', subdomain });

      sendgridMail.setApiKey(SENDGRID_API_KEY);
    }
  } catch (e) {
    return debugError(e.message);
  }

  const { data = {}, name } = template;

  // for unsubscribe url
  data.domain = DOMAIN;

  let hasCompanyFromEmail = COMPANY_EMAIL_FROM && COMPANY_EMAIL_FROM.length > 0;

  if (models && subdomain && getOrganizationDetail) {
    const organization = await getOrganizationDetail({ subdomain });

    if (organization.isWhiteLabel) {
      data.whiteLabel = true;
      data.organizationName = organization.name || '';
      data.organizationDomain = organization.domain || '';

      hasCompanyFromEmail = true;
    } else {
      hasCompanyFromEmail = false;
    }
  }

  for (const toEmail of toEmails) {
    if (modifier) {
      modifier(data, toEmail);
    }

    // generate email content by given template
    let html;

    if (name) {
      html = await applyTemplate(data, name);
    } else if (
      !defaultTemplate ||
      !defaultTemplateType ||
      (defaultTemplateType && defaultTemplateType.toString() === 'simple')
    ) {
      html = await applyTemplate(data, 'base');
    } else if (defaultTemplate) {
      html = Handlebars.compile(defaultTemplate.toString())(data || {});
    }

    if (customHtml) {
      html = Handlebars.compile(customHtml)(customHtmlData || {});
    }

    const mailOptions: any = {
      from:
        fromEmail ||
        (hasCompanyFromEmail
          ? `Noreply <${COMPANY_EMAIL_FROM}>`
          : 'noreply@erxes.io'),
      to: toEmail,
      subject: title,
      html,
      attachments,
    };

    if (!mailOptions.from) {
      throw new Error(`"From" email address is missing: ${mailOptions.from}`);
    }

    let headers: { [key: string]: string } = {};

    if (models && subdomain) {
      const emailDelivery = (await models.EmailDeliveries.createEmailDelivery({
        kind: 'transaction',
        to: [toEmail],
        from: mailOptions.from,
        subject: title || '',
        body: html,
        status: 'pending',
      })) as any;

      headers = {
        'X-SES-CONFIGURATION-SET': AWS_SES_CONFIG_SET || 'erxes',
        EmailDeliveryId: emailDelivery && emailDelivery._id,
      };
    }

    if (AWS_SES_ACCESS_KEY_ID && AWS_SES_SECRET_ACCESS_KEY) {
      headers['X-SES-CONFIGURATION-SET'] = AWS_SES_CONFIG_SET || 'erxes-saas';
    }

    mailOptions.headers = headers;

    try {
      if (sendgridMail) {
        await sendgridMail.send(mailOptions).then(
          () => {},
          (error) => {
            console.error(error);

            if (error.response) {
              console.error(error.response.body);
            }
          },
        );
      } else {
        await transporter.sendMail(mailOptions);
      }
    } catch (e) {
      debugError(`Error sending email: ${e.message}`);
    }
  }
};

/**
 * Create default or ses transporter
 */
export const createTransporter = async ({ ses }, models?: IModels) => {
  if (ses) {
    const AWS_SES_ACCESS_KEY_ID = await getConfig(
      'AWS_SES_ACCESS_KEY_ID',
      '',
      models,
    );
    const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
      'AWS_SES_SECRET_ACCESS_KEY',
      '',
      models,
    );
    const AWS_REGION = await getConfig('AWS_REGION', '', models);

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' }),
    });
  }

  const MAIL_SERVICE = await getConfig('MAIL_SERVICE', '', models);
  const MAIL_PORT = await getConfig('MAIL_PORT', '', models);
  const MAIL_USER = await getConfig('MAIL_USER', '', models);
  const MAIL_PASS = await getConfig('MAIL_PASS', '', models);
  const MAIL_HOST = await getConfig('MAIL_HOST', '', models);

  let auth;

  if (MAIL_USER && MAIL_PASS) {
    auth = {
      user: MAIL_USER,
      pass: MAIL_PASS,
    };
  }

  return nodemailer.createTransport({
    service: MAIL_SERVICE,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth,
  });
};

export const uploadsFolderPath = path.join(__dirname, '../private/uploads');

export const initFirebase = async (
  models: IModels,
  customConfig?: string,
  customName?: string,
): Promise<void> => {
  let codeString = 'value';

  // get google application credentials JSON
  if (customConfig) {
    codeString = customConfig;
  } else {
    const GOOGLE_APPLICATION_CREDENTIALS_JSON = await getConfig(
      'GOOGLE_APPLICATION_CREDENTIALS_JSON',
      '',
      models,
    );
    if (!GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      throw new Error(
        'Cannot find google application credentials JSON configuration',
      );
    }
    codeString = GOOGLE_APPLICATION_CREDENTIALS_JSON;
  }

  if (codeString[0] === '{' && codeString[codeString.length - 1] === '}') {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      try {
        admin.initializeApp(
          {
            credential: admin.credential.cert(serviceAccount),
          },
          customName || '[DEFAULT]',
        );
      } catch (e) {
        debugError(`initFireBase error: ${e.message}`);
      }
    }
  }
};

/*
 * Check that given file is not harmful
 */
export const checkFile = async (models: IModels, file, source?: string) => {
  if (!file) {
    throw new Error('Invalid file');
  }

  const { size } = file;
  console.log(file, 'filefile');
  // 20mb
  if (size > 20 * 1024 * 1024) {
    return 'Too large file';
  }

  // read file
  const buffer = await fs.readFileSync(file.path);

  // determine file type using magic numbers
  const ft = fileType(buffer);
  const unsupportedMimeTypes = [
    'text/csv',
    'image/svg+xml',
    'text/plain',
    'application/vnd.ms-excel',
    'audio/mp3',
    'audio/wave',
    'audio/vnd.wave',
  ];

  const oldMsOfficeDocs = [
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
  ];

  // allow csv, svg to be uploaded
  if (!ft && unsupportedMimeTypes.includes(file.type)) {
    return 'ok';
  }

  if (!ft) {
    return 'Invalid file type';
  }

  let { mime } = ft;

  if (mime === 'application/zip' && file.name.endsWith('.hwpx')) {
    mime = 'application/haansoft-hwpml';
  }

  if (mime === 'application/x-msi' && file.name.endsWith('.hwp')) {
    mime = 'application/haansoft-hwp';
  }

  // allow old ms office docs to be uploaded
  if (mime === 'application/x-msi' && oldMsOfficeDocs.includes(file.type)) {
    return 'ok';
  }

  const defaultMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'image/gif',
    'audio/mp4',
    'audio/vnd.wave',
    'audio/wave',
  ];

  const UPLOAD_FILE_TYPES = await getConfig(
    source === 'widgets' ? 'WIDGETS_UPLOAD_FILE_TYPES' : 'UPLOAD_FILE_TYPES',
    '',
    models,
  );

  if (!(UPLOAD_FILE_TYPES && UPLOAD_FILE_TYPES.includes(mime))) {
    if (!defaultMimeTypes.includes(mime)) {
      return 'Invalid configured file type';
    }
  }

  return 'ok';
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

  // initialize s3
  return new AWS.S3(options);
};

/**
 * Create Google Cloud Storage instance
 */
const createGCS = async (models?: IModels) => {
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

  const Storage = require('@google-cloud/storage').Storage;

  // initializing Google Cloud Storage
  return new Storage({
    projectId: GOOGLE_PROJECT_ID,
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  });
};

/*
 * Create Google Cloud Storage instance
 */
const createCFR2 = async (models?: IModels) => {
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

export const uploadToCFImages = async (
  file: any,
  forcePrivate?: boolean,
  models?: IModels,
) => {
  const sanitizedFilename = sanitizeFilename(file.name);

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
  formData.append('file', fs.createReadStream(file.path));
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

// upload file to Cloudflare stream
const uploadToCFStream = async (file: any, models?: IModels) => {
  const sanitizedFilename = sanitizeFilename(file.name);

  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } =
    await getFileUploadConfigs(models);

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;
  const headers = {
    Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
  };

  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  const formData = new FormData();
  formData.append('file', fs.createReadStream(file.path));
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
 * Save file to Cloudflare
 */

export const uploadFileCloudflare = async (
  file: { name: string; path: string; type: string },
  forcePrivate: boolean = false,
  models?: IModels,
): Promise<string> => {
  const fileObj = file;
  const IS_PUBLIC = forcePrivate
    ? false
    : await getConfig('FILE_SYSTEM_PUBLIC', 'false');
  const sanitizedFilename = sanitizeFilename(fileObj.name);

  const { CLOUDFLARE_BUCKET_NAME, CLOUDFLARE_USE_CDN } =
    await getFileUploadConfigs(models);

  const detectedType = fileType(fs.readFileSync(fileObj.path));

  if (path.extname(fileObj.name).toLowerCase() === `.jfif`) {
    fileObj.name = fileObj.name.replace('.jfif', '.jpeg');
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
    return uploadToCFImages(fileObj, forcePrivate, models);
  }

  if (
    (CLOUDFLARE_USE_CDN === 'true' || CLOUDFLARE_USE_CDN === true) &&
    detectedType &&
    isVideo(detectedType.mime)
  ) {
    return uploadToCFStream(fileObj, models);
  }

  // generate unique name
  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  // read fileObj
  const buffer = await fs.readFileSync(fileObj.path);

  // initialize r2
  const r2 = await createCFR2(models);

  // upload to r2

  const response: any = await new Promise((resolve, reject) => {
    r2.upload(
      {
        ContentType: fileObj.type,
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
 * Save binary data to amazon s3
 */
export const uploadFileAWS = async (
  file: { name: string; path: string; type: string },
  forcePrivate: boolean = false,
  models?: IModels,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(file.name);

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
  const buffer = await fs.readFileSync(file.path);

  // upload to s3
  const response: any = await new Promise((resolve, reject) => {
    s3.upload(
      {
        ContentType: file.type,
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
 * Save file to local disk
 */
export const uploadFileLocal = async (file: {
  name: string;
  path: string;
  type: string;
}): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(file.name);
  const oldPath = file.path;

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
 * Save file to google cloud storage
 */
export const uploadFileGCS = async (
  file: {
    name: string;
    path: string;
    type: string;
  },
  models: IModels,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(file.name);

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
      file.path,
      {
        metadata: { contentType: file.type },
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

const deleteFileLocal = async (fileName: string) => {
  return new Promise((resolve, reject) => {
    fs.unlink(`${uploadsFolderPath}/${fileName}`, (error) => {
      if (error) {
        return reject(error);
      }

      return resolve('deleted');
    });
  });
};

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
      .then((err) => {
        if (err) {
          return reject(err);
        }

        return resolve('ok');
      });
  });
};

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

  if (!VERSION || VERSION !== 'saas') {
    if (!key.startsWith(CLOUDFLARE_BUCKET_NAME)) {
      fileName = `${CLOUDFLARE_BUCKET_NAME}/${key}`;
    }
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
      .catch((_err) => {
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
 * Create Azure Blob Storage instance
 */
const createAzureBlobStorage = async (models?: IModels) => {
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

  const BlobServiceClient = require('@azure/storage-blob').BlobServiceClient;

  // Initialize Azure Blob Storage
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING,
  );

  // return a specific container client
  return blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
};

/*
 * Delete file from Azure storage
 */
export const deleteFileAzure = async (fileName: string, models?: IModels) => {
  try {
    // Initialize the Azure Blob container client
    const containerClient = await createAzureBlobStorage(models); // Assuming this function provides a container client

    // Get the blob client for the specified file key
    const blobClient = containerClient.getBlobClient(fileName);

    // Check if the blob exists
    const exists = await blobClient.exists();
    if (!exists) {
      console.error(`File with key ${fileName} does not exist.`);
      return;
    }

    // Delete the blob
    await blobClient.delete();
    console.debug(
      `File with key ${fileName} successfully deleted from Azure Blob Storage.`,
    );
  } catch (error) {
    throw error;
  }
};

/*
 * Save file to azure blob storage
 */

export const uploadFileAzure = async (
  file: {
    name: string;
    path: string;
    type: string;
  },
  models: IModels,
): Promise<string> => {
  const sanitizedFilename = sanitizeFilename(file.name);

  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC', 'true', models);

  // initialize Azure Blob Storage
  const containerClient = await createAzureBlobStorage(models);

  // generate unique name
  const fileName = `${randomAlphanumeric()}${sanitizedFilename}`;

  // Create a block blob for the file
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  // Upload data to the blob
  const response = await blockBlobClient.uploadFile(file.path, {
    blobHTTPHeaders: { blobContentType: file.type },
  });

  if (!response) {
    throw new Error('Error uploading file to Azure Blob Storage');
  }

  // Return either the blob's URL or its name, depending on public status
  return IS_PUBLIC === 'true' ? blockBlobClient.url : fileName;
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
  subdomain,
  models,
  userId,
  width,
}: {
  key: string;
  subdomain: string;
  models?: IModels;
  userId: string;
  width?: number;
}): Promise<any> => {
  const services = await getServices();
  const sanitizedFileKey = sanitizeFilename(key);

  for (const serviceName of services) {
    const service = await getService(serviceName);
    const meta = service.config?.meta || {};

    if (meta && meta.readFileHook) {
      await sendCommonMessage({
        subdomain,
        action: 'readFileHook',
        isRPC: true,
        serviceName,
        data: { key, userId },
      });
    }
  }

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
              debugBase(
                `Error occurred when fetching s3 file with key: "${key}"`,
              );
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
      fs.readFile(
        `${uploadsFolderPath}/${sanitizedFileKey}`,
        (error, response) => {
          if (error) {
            return reject(error);
          }

          return resolve(response);
        },
      );
    });
  }
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
      VERSION === 'saas' ? true : false,
      models,
    );
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    nameOrLink = await uploadFileLocal(file);
  }

  if (fromEditor) {
    const editorResult = { fileName: file.name, uploaded: 1, url: nameOrLink };

    if (IS_PUBLIC !== 'true') {
      editorResult.url = `${apiUrl}/read-file?key=${nameOrLink}`;
    }

    return editorResult;
  }

  return nameOrLink;
};

export const deleteFile = async (
  models: IModels,
  fileName: string,
): Promise<any> => {
  const sanitizedFilename = sanitizeFilename(fileName);

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
    return deleteFileLocal(sanitizedFilename);
  }
};

/**
 * Creates blank workbook
 */
export const createXlsFile = async () => {
  // Generating blank workbook
  const workbook = await xlsxPopulate.fromBlankAsync();

  return { workbook, sheet: workbook.sheet(0) };
};

/**
 * Generates downloadable xls file on the url
 */
export const generateXlsx = async (workbook: any): Promise<string> => {
  return workbook.outputAsync();
};

export const registerOnboardHistory = ({
  models,
  type,
  user,
}: {
  models: IModels;
  type: string;
  user: IUserDocument;
}) =>
  models.OnboardingHistories.getOrCreate({ type, user })
    .then(({ status }) => {
      if (status === 'created') {
        graphqlPubsub.publish('onboardingChanged', {
          onboardingChanged: { userId: user._id, type },
        });
      }
    })
    .catch((e) => debugBase(e));

export const getConfigs = async (models) => {
  const configsMap = {};
  const configs = await models.Configs.find({}).lean();

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (
  code: string,
  defaultValue?: string,
  models?: IModels,
) => {
  if (!models) {
    return getEnv({ name: code, defaultValue });
  }

  const configs = await getConfigs(models);

  const envValue = getEnv({ name: code, defaultValue });

  if (!configs[code]) {
    return envValue || defaultValue;
  }

  return configs[code];
};

export const resetConfigsCache = async () => {
  await redis.set('configs_erxes_api', '');
};

export const getCoreDomain = () => {
  const NODE_ENV = process.env.NODE_ENV;

  return NODE_ENV === 'production'
    ? 'https://erxes.io'
    : 'http://localhost:3500';
};

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      debugError((e as Error).message);

      if (callback) {
        return callback(res, e, next);
      }

      return next(e);
    }
  };
};

export const isUsingElk = () => {
  const ELK_SYNCER = getEnv({ name: 'ELK_SYNCER', defaultValue: 'true' });

  return ELK_SYNCER === 'false' ? false : true;
};

export const checkPremiumService = async (type) => {
  try {
    const domain = getEnv({ name: 'DOMAIN' })
      .replace('https://', '')
      .replace('http://', '');

    const response = await fetch(
      `${getCoreDomain()}/check-premium-service?` +
        new URLSearchParams({ domain, type }),
    ).then((r) => r.text());

    return response === 'yes';
  } catch (e) {
    return false;
  }
};

// board item number calculator
export const numberCalculator = (size: number, num?: any, skip?: boolean) => {
  if (num && !skip) {
    num = parseInt(num, 10) + 1;
  }

  if (skip) {
    num = 0;
  }

  num = num.toString();

  while (num.length < size) {
    num = '0' + num;
  }

  return num;
};

export const configReplacer = (config) => {
  const now = new Date();

  // replace type of date
  return config
    .replace(/\{year}/g, now.getFullYear().toString())
    .replace(/\{month}/g, (now.getMonth() + 1).toString())
    .replace(/\{day}/g, now.getDate().toString());
};

/**
 * Send notification to mobile device from inbox conversations
 * @param {string} - title
 * @param {string} - body
 * @param {string} - customerId
 * @param {array} - receivers
 */
export const sendMobileNotification = async (
  models: IModels,
  {
    customConfig,
    receivers,
    title,
    body,
    deviceTokens,
    data,
  }: {
    customConfig: string;
    receivers: string[];
    title: string;
    body: string;
    deviceTokens?: string[];
    data?: any;
  },
): Promise<void> => {
  if (!admin.apps.length) {
    await initFirebase(models, customConfig);
  }
  const additionalConfigs = await models.Configs.findOne({
    code: 'GOOGLE_APP_ADDITIONAL_CREDS_JSON',
  });

  if (admin.apps.length === 1 && additionalConfigs) {
    (additionalConfigs?.value || []).forEach(async (item, index) => {
      await initFirebase(models, item, `app${index + 1}`);
    });
  }

  const tokens: string[] = [];

  if (receivers) {
    const xs = await models.Users.find({
      _id: { $in: receivers },
      role: { $ne: USER_ROLES.SYSTEM },
    }).distinct('deviceTokens');

    for (let x of xs) {
      if (x) {
        tokens.push(x);
      }
    }
  }

  if (deviceTokens && deviceTokens.length) {
    tokens.push(...deviceTokens);
  }

  if (tokens.length > 0) {
    // send notification
    for (const app of admin.apps) {
      if (app) {
        const transporter = app.messaging();

        for (const token of tokens) {
          await transporter
            .send({
              token,
              notification: { title, body },
              data: data || {},
            })
            .catch(async (e) => {
              debugError(`Error occurred during firebase send: ${e.message}`);

              if (!e.message.includes('SenderId mismatch')) {
                await models.Users.updateOne(
                  { deviceTokens: token },
                  { $pull: { deviceTokens: token } },
                );
              }
            });
        }
      }
    }
  }
};

export const getFileUploadConfigs = async (models?: IModels) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    return {
      UPLOAD_SERVICE_TYPE: getEnv({ name: 'UPLOAD_SERVICE_TYPE' }),
      CLOUDFLARE_BUCKET_NAME: getEnv({ name: 'CLOUDFLARE_BUCKET_NAME' }),
      CLOUDFLARE_ACCOUNT_ID: getEnv({ name: 'CLOUDFLARE_ACCOUNT_ID' }),
      CLOUDFLARE_ACCESS_KEY_ID: getEnv({ name: 'CLOUDFLARE_ACCESS_KEY_ID' }),
      CLOUDFLARE_SECRET_ACCESS_KEY: getEnv({
        name: 'CLOUDFLARE_SECRET_ACCESS_KEY',
      }),
      CLOUDFLARE_API_TOKEN: getEnv({ name: 'CLOUDFLARE_API_TOKEN' }),
      CLOUDFLARE_USE_CDN: getEnv({ name: 'CLOUDFLARE_USE_CDN' }),
      CLOUDFLARE_ACCOUNT_HASH: getEnv({ name: 'CLOUDFLARE_ACCOUNT_HASH' }),
    };
  }

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

  const UPLOAD_SERVICE_TYPE = await getConfig(
    'UPLOAD_SERVICE_TYPE',
    'AWS',
    models,
  );

  const CLOUDFLARE_BUCKET_NAME = await getConfig(
    'CLOUDFLARE_BUCKET_NAME',
    '',
    models,
  );

  const CLOUDFLARE_ACCOUNT_ID = await getConfig(
    'CLOUDFLARE_ACCOUNT_ID',
    '',
    models,
  );
  const CLOUDFLARE_ACCESS_KEY_ID = await getConfig(
    'CLOUDFLARE_ACCESS_KEY_ID',
    '',
    models,
  );
  const CLOUDFLARE_SECRET_ACCESS_KEY = await getConfig(
    'CLOUDFLARE_SECRET_ACCESS_KEY',
    '',
    models,
  );

  const CLOUDFLARE_API_TOKEN = await getConfig(
    'CLOUDFLARE_API_TOKEN',
    '',
    models,
  );

  const CLOUDFLARE_USE_CDN = await getConfig('CLOUDFLARE_USE_CDN', '', models);

  const CLOUDFLARE_ACCOUNT_HASH = await getConfig(
    'CLOUDFLARE_ACCOUNT_HASH',
    '',
    models,
  );

  return {
    AWS_FORCE_PATH_STYLE,
    AWS_COMPATIBLE_SERVICE_ENDPOINT,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID,
    UPLOAD_SERVICE_TYPE,
    CLOUDFLARE_BUCKET_NAME,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY,
    CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_USE_CDN,
    CLOUDFLARE_ACCOUNT_HASH,
  };
};

export const saveValidatedToken = (token: string, user: IUserDocument) => {
  return redis.set(`user_token_${user._id}_${token}`, 1, 'EX', 24 * 60 * 60);
};

/*
 * Handle engage unsubscribe request
 */
export const handleUnsubscription = async (
  models: IModels,
  subdomain: string,
  query: {
    cid: string;
    uid: string;
  },
) => {
  const { cid, uid } = query;

  if (cid) {
    await models.Customers.updateOne({ _id: cid }, { isSubscribed: 'No' });
  }

  if (uid) {
    await models.Users.updateOne(
      {
        _id: uid,
      },
      { $set: { isSubscribed: 'No' } },
    );
  }
};

export const resizeImage = async (
  file: any,
  maxWidth?: number,
  maxHeight?: number,
) => {
  try {
    let image = await jimp.read(`${file.path}`);

    if (!image) {
      throw new Error('Error reading image');
    }

    if (maxWidth && image.getWidth() > maxWidth) {
      image = image.resize(maxWidth, jimp.AUTO);
    } else if (maxHeight && image.getHeight() > maxHeight) {
      image = image.resize(jimp.AUTO, maxHeight);
    }

    await image.writeAsync(file.path);

    return file;
  } catch (error) {
    console.error(error);
    return file;
  }
};

export const isVideo = (mimeType: string) => {
  return mimeType.includes('video');
};

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[],
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    action: 'tag',
    serviceName,
    data: {
      type: contentType,
      _ids,
      action: 'count',
    },
    isRPC: true,
  });
};

export const getContentTypes = async (serviceName) => {
  const service = await getService(serviceName);
  const meta = service.config.meta || {};
  const types = (meta.tags && meta.tags.types) || [];
  return types.map((type) => `${serviceName}:${type.type}`);
};

export const tagObject = async (
  models: IModels,
  subdomain: string,
  type: string,
  tagIds: string[],
  targetIds: string[],
) => {
  const [serviceName, contentType] = type.split(':');

  if (serviceName === 'core') {
    const modelMap = {
      customer: models.Customers,
      user: models.Users,
      company: models.Companies,
      form: models.Forms,
      product: models.Products,
    };
    await modelMap[contentType].updateMany(
      { _id: { $in: targetIds } },
      { $set: { tagIds } },
    );
    return modelMap[contentType].find({ _id: { $in: targetIds } }).lean();
  }

  return sendCommonMessage({
    subdomain,
    serviceName,
    action: 'tag',
    data: {
      tagIds,
      targetIds,
      type: contentType,
      action: 'tagObject',
    },
    isRPC: true,
  });
};

export const fixRelatedItems = async ({
  subdomain,
  type,
  sourceId,
  destId,
  action,
}: {
  subdomain: string;
  type: string;
  sourceId: string;
  destId?: string;
  action: string;
}) => {
  const [serviceName, contentType] = type.split(':');

  sendCommonMessage({
    subdomain,
    serviceName,
    action: 'fixRelatedItems',
    data: {
      sourceId,
      destId,
      type: contentType,
      action,
    },
  });
};

export async function handleTagsPublishChange(
  services,
  serviceNameFromType,
  subdomain,
  targetIds,
) {
  for (const serviceName of services) {
    if (serviceName !== serviceNameFromType) continue;

    const service = await getService(serviceName);
    const meta = service.config?.meta || {};

    if (meta?.tags?.publishChangeAvailable) {
      await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'publishChange',
        data: {
          targetIds,
          type: 'tag',
        },
      });
    }
  }
}

export const extractServiceName = (type: string) => {
  return (type || '').split(':')[0];
};

export const getEnv = utils.getEnv;
export const paginate = utils.paginate;
export const fixDate = utils.fixDate;
export const getDate = utils.getDate;
export const getToday = utils.getToday;
export const getNextMonth = utils.getNextMonth;
export const cleanHtml = utils.cleanHtml;
export const validSearchText = utils.validSearchText;
export const regexSearchText = utils.regexSearchText;
export const checkUserIds = utils.checkUserIds;
export const chunkArray = utils.chunkArray;
export const splitStr = utils.splitStr;
export const escapeRegExp = utils.escapeRegExp;
export const getUserDetail = utils.getUserDetail;

export default {
  sendEmail,
  readFile,
  createTransporter,
};
