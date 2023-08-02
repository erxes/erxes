import * as AWS from 'aws-sdk';
import utils from '@erxes/api-utils/src';
import * as fileType from 'file-type';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsxPopulate from 'xlsx-populate';
import { IUserDocument } from '../db/models/definitions/users';
import { debugBase, debugError } from '../debuggers';
import memoryStorage from '../inmemoryStorage';
import { graphqlPubsub } from '../pubsub';
import * as _ from 'underscore';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { sendCommonMessage, sendLogsMessage } from '../messageBroker';
import { IModels } from '../connectionResolver';
import { USER_ROLES } from '@erxes/api-utils/src/constants';
import { getService, getServices, redis } from '../serviceDiscovery';
import { sendContactsMessage } from '../messageBroker';

export interface IEmailParams {
  toEmails?: string[];
  fromEmail?: string;
  title?: string;
  customHtml?: string;
  customHtmlData?: any;
  template?: { name?: string; data?: any };
  attachments?: object[];
  modifier?: (data: any, email: string) => void;
}

/**
 * Read contents of a file
 */
export const readFile = (filename: string) => {
  let folder = 'dist/core/src';

  if (process.env.NODE_ENV !== 'production') {
    folder = 'src';
  }

  if (fs.existsSync('./build/api')) {
    folder = 'build/api';
  }

  const filePath = `./${folder}/private/emailTemplates/${filename}.html`;

  return fs.readFileSync(filePath, 'utf8');
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
  models?: IModels
) => {
  const {
    toEmails = [],
    fromEmail,
    title,
    customHtml,
    customHtmlData,
    template = {},
    modifier,
    attachments
  } = params;

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const DEFAULT_EMAIL_SERVICE = await getConfig(
    'DEFAULT_EMAIL_SERVICE',
    'SES',
    models
  );
  const defaultTemplate = await getConfig('COMPANY_EMAIL_TEMPLATE', '', models);
  const defaultTemplateType = await getConfig(
    'COMPANY_EMAIL_TEMPLATE_TYPE',
    '',
    models
  );
  const COMPANY_EMAIL_FROM = await getConfig('COMPANY_EMAIL_FROM', '', models);
  const AWS_SES_CONFIG_SET = await getConfig('AWS_SES_CONFIG_SET', '', models);
  const AWS_SES_ACCESS_KEY_ID = await getConfig(
    'AWS_SES_ACCESS_KEY_ID',
    '',
    models
  );
  const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
    'AWS_SES_SECRET_ACCESS_KEY',
    '',
    models
  );

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  // do not send email it is running in test mode
  if (NODE_ENV === 'test') {
    return;
  }

  // try to create transporter or throw configuration error
  let transporter;

  try {
    transporter = await createTransporter(
      { ses: DEFAULT_EMAIL_SERVICE === 'SES' },
      models
    );
  } catch (e) {
    return debugError(e.message);
  }

  const { data = {}, name } = template;

  // for unsubscribe url
  data.domain = DOMAIN;

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
      from: fromEmail || COMPANY_EMAIL_FROM,
      to: toEmail,
      subject: title,
      html,
      attachments
    };

    if (!mailOptions.from) {
      throw new Error(`"From" email address is missing: ${mailOptions.from}`);
    }

    let headers: { [key: string]: string } = {};

    if (
      AWS_SES_ACCESS_KEY_ID.length > 0 &&
      AWS_SES_SECRET_ACCESS_KEY.length > 0
    ) {
      const emailDelivery = await sendLogsMessage({
        subdomain,
        action: 'emailDeliveries.create',
        data: {
          kind: 'transaction',
          to: toEmail,
          from: mailOptions.from,
          subject: title,
          body: html,
          status: 'pending'
        },
        isRPC: true
      });

      headers = {
        'X-SES-CONFIGURATION-SET': AWS_SES_CONFIG_SET || 'erxes',
        EmailDeliveryId: emailDelivery && emailDelivery._id
      };
    } else {
      headers['X-SES-CONFIGURATION-SET'] = 'erxes';
    }

    mailOptions.headers = headers;

    return transporter.sendMail(mailOptions, (error, info) => {
      debugError(error);
      debugError(info);
    });
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
      models
    );
    const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
      'AWS_SES_SECRET_ACCESS_KEY',
      '',
      models
    );
    const AWS_REGION = await getConfig('AWS_REGION', '', models);

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' })
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
      pass: MAIL_PASS
    };
  }

  return nodemailer.createTransport({
    service: MAIL_SERVICE,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth
  });
};

export const uploadsFolderPath = path.join(__dirname, '../private/uploads');

export const initFirebase = async (models: IModels): Promise<void> => {
  const config = await models.Configs.findOne({
    code: 'GOOGLE_APPLICATION_CREDENTIALS_JSON'
  });

  if (!config) {
    return;
  }

  const codeString = config.value || 'value';

  if (codeString[0] === '{' && codeString[codeString.length - 1] === '}') {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
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
    'audio/mp3'
  ];

  const oldMsOfficeDocs = [
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint'
  ];

  // allow csv, svg to be uploaded
  if (!ft && unsupportedMimeTypes.includes(file.type)) {
    return 'ok';
  }

  if (!ft) {
    return 'Invalid file type';
  }

  const { mime } = ft;

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
    'image/gif'
  ];

  const UPLOAD_FILE_TYPES = await getConfig(
    source === 'widgets' ? 'WIDGETS_UPLOAD_FILE_TYPES' : 'UPLOAD_FILE_TYPES',
    '',
    models
  );

  if (
    !(
      (UPLOAD_FILE_TYPES && UPLOAD_FILE_TYPES.split(',')) ||
      defaultMimeTypes
    ).includes(mime)
  ) {
    return 'Invalid configured file type';
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
    models
  );
  const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);
  const AWS_COMPATIBLE_SERVICE_ENDPOINT = await getConfig(
    'AWS_COMPATIBLE_SERVICE_ENDPOINT',
    '',
    models
  );
  const AWS_FORCE_PATH_STYLE = await getConfig(
    'AWS_FORCE_PATH_STYLE',
    '',
    models
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
    secretAccessKey: AWS_SECRET_ACCESS_KEY
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
    models
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
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS
  });
};

/*
 * Save binary data to amazon s3
 */
export const uploadFileAWS = async (
  file: { name: string; path: string; type: string },
  forcePrivate: boolean = false,
  models?: IModels
): Promise<string> => {
  const IS_PUBLIC = forcePrivate
    ? false
    : await getConfig('FILE_SYSTEM_PUBLIC', 'true', models);
  const AWS_PREFIX = await getConfig('AWS_PREFIX', '', models);
  const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);

  // initialize s3
  const s3 = await createAWS(models);

  // generate unique name
  const fileName = `${AWS_PREFIX}${Math.random()}${file.name.replace(
    / /g,
    ''
  )}`;

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
        ACL: IS_PUBLIC === 'true' ? 'public-read' : undefined
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      }
    );
  });

  return IS_PUBLIC === 'true' ? response.Location : fileName;
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
    s3.deleteObject(params, err => {
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
  const oldPath = file.path;

  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath);
  }

  const fileName = `${Math.random()}${file.name.replace(/ /g, '')}`;
  const newPath = `${uploadsFolderPath}/${fileName}`;
  const rawData = fs.readFileSync(oldPath);

  return new Promise((resolve, reject) => {
    fs.writeFile(newPath, rawData, err => {
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
  models: IModels
): Promise<string> => {
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET', '', models);
  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC', '', models);

  // initialize GCS
  const storage = await createGCS(models);

  // select bucket
  const bucket = storage.bucket(BUCKET);

  // generate unique name
  const fileName = `${Math.random()}${file.name}`;

  bucket.file(fileName);

  const response: any = await new Promise((resolve, reject) => {
    bucket.upload(
      file.path,
      {
        metadata: { contentType: file.type },
        public: IS_PUBLIC === 'true'
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        if (res) {
          return resolve(res);
        }
      }
    );
  });

  const { metadata, name } = response;

  return IS_PUBLIC === 'true' ? metadata.mediaLink : name;
};

const deleteFileLocal = async (fileName: string) => {
  return new Promise((resolve, reject) => {
    fs.unlink(`${uploadsFolderPath}/${fileName}`, error => {
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
      .then(err => {
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
export const readFileRequest = async ({
  key,
  subdomain,
  models,
  userId
}: {
  userId: string;
  key: string;
  subdomain: string;
  models?: IModels;
}): Promise<any> => {
  const services = await getServices();

  for (const serviceName of services) {
    const service = await getService(serviceName, true);
    const meta = service.config?.meta || {};

    if (meta && meta.readFileHook) {
      await sendCommonMessage({
        subdomain,
        action: 'readFileHook',
        isRPC: true,
        serviceName,
        data: { key, userId }
      });
    }
  }

  const UPLOAD_SERVICE_TYPE = await getConfig(
    'UPLOAD_SERVICE_TYPE',
    'AWS',
    models
  );

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    const GCS_BUCKET = await getConfig(
      'GOOGLE_CLOUD_STORAGE_BUCKET',
      '',
      models
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
          Key: key
        },
        (error, response) => {
          if (error) {
            if (
              error.code === 'NoSuchKey' &&
              error.message.includes('key does not exist')
            ) {
              debugBase(
                `Error occurred when fetching s3 file with key: "${key}"`
              );
            }

            return reject(error);
          }

          return resolve(response.Body);
        }
      );
    });
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

/*
 * Save binary data to amazon s3
 */
export const uploadFile = async (
  apiUrl: string,
  file,
  fromEditor = false,
  models: IModels
): Promise<any> => {
  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC', '', models);
  const UPLOAD_SERVICE_TYPE = await getConfig(
    'UPLOAD_SERVICE_TYPE',
    'AWS',
    models
  );

  let nameOrLink = '';

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    nameOrLink = await uploadFileAWS(file, false, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    nameOrLink = await uploadFileGCS(file, models);
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
  fileName: string
): Promise<any> => {
  const UPLOAD_SERVICE_TYPE = await getConfig(
    'UPLOAD_SERVICE_TYPE',
    'AWS',
    models
  );

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    return deleteFileAWS(fileName, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    return deleteFileGCS(fileName, models);
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    return deleteFileLocal(fileName);
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
  user
}: {
  models: IModels;
  type: string;
  user: IUserDocument;
}) =>
  models.OnboardingHistories.getOrCreate({ type, user })
    .then(({ status }) => {
      if (status === 'created') {
        graphqlPubsub.publish('onboardingChanged', {
          onboardingChanged: { userId: user._id, type }
        });
      }
    })
    .catch(e => debugBase(e));

export const getConfigs = async models => {
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
  models?: IModels
) => {
  const configs = await getConfigs(models);

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const resetConfigsCache = () => {
  memoryStorage().set('configs_erxes_api', '');
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

export const checkPremiumService = async type => {
  try {
    const domain = getEnv({ name: 'DOMAIN' })
      .replace('https://', '')
      .replace('http://', '');

    const response = await sendRequest({
      url: `${getCoreDomain()}/check-premium-service?domain=${domain}&type=${type}`,
      method: 'GET'
    });

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

export const configReplacer = config => {
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
    receivers,
    title,
    body,
    deviceTokens,
    data
  }: {
    receivers: string[];
    title: string;
    body: string;
    deviceTokens?: string[];
    data?: any;
  }
): Promise<void> => {
  if (!admin.apps.length) {
    await initFirebase(models);
  }

  const transporter = admin.messaging();
  const tokens: string[] = [];

  if (receivers) {
    tokens.push(
      ...(await models.Users.find({
        _id: { $in: receivers },
        role: { $ne: USER_ROLES.SYSTEM }
      }).distinct('deviceTokens'))
    );
  }

  if (deviceTokens && deviceTokens.length) {
    tokens.push(...deviceTokens);
  }

  if (tokens.length > 0) {
    // send notification
    for (const token of tokens) {
      try {
        await transporter.send({
          token,
          notification: { title, body },
          data: data || {}
        });
      } catch (e) {
        debugError(`Error occurred during firebase send: ${e.message}`);

        await models.Users.updateOne(
          { deviceTokens: token },
          { $pull: { deviceTokens: token } }
        );
      }
    }
  }
};

export const getFileUploadConfigs = async (models: IModels) => {
  const AWS_ACCESS_KEY_ID = await getConfig('AWS_ACCESS_KEY_ID', '', models);
  const AWS_SECRET_ACCESS_KEY = await getConfig(
    'AWS_SECRET_ACCESS_KEY',
    '',
    models
  );
  const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);
  const AWS_COMPATIBLE_SERVICE_ENDPOINT = await getConfig(
    'AWS_COMPATIBLE_SERVICE_ENDPOINT',
    '',
    models
  );
  const AWS_FORCE_PATH_STYLE = await getConfig(
    'AWS_FORCE_PATH_STYLE',
    '',
    models
  );

  const UPLOAD_SERVICE_TYPE = await getConfig(
    'UPLOAD_SERVICE_TYPE',
    'AWS',
    models
  );

  return {
    AWS_FORCE_PATH_STYLE,
    AWS_COMPATIBLE_SERVICE_ENDPOINT,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID,
    UPLOAD_SERVICE_TYPE
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
  }
) => {
  const { cid, uid } = query;

  if (cid) {
    await sendContactsMessage({
      subdomain,
      action: 'customers.updateOne',
      data: {
        selector: {
          _id: cid
        },
        modifier: {
          $set: { isSubscribed: 'No' }
        }
      },
      isRPC: true,
      defaultValue: {}
    });
  }

  if (uid) {
    await models.Users.updateOne(
      {
        _id: uid
      },
      { $set: { isSubscribed: 'No' } }
    );
  }
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
export const sendRequest = utils.sendRequest;

export default {
  sendEmail,
  readFile,
  createTransporter
};
