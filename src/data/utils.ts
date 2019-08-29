import * as AWS from 'aws-sdk';
import * as EmailValidator from 'email-deep-validator';
import * as fileType from 'file-type';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as requestify from 'requestify';
import * as xlsxPopulate from 'xlsx-populate';
import { Customers, Notifications, Users } from '../db/models';
import { IUser, IUserDocument } from '../db/models/definitions/users';
import { debugEmail, debugExternalApi } from '../debuggers';
import { graphqlPubsub } from '../pubsub';

/*
 * Check that given file is not harmful
 */
export const checkFile = async file => {
  if (!file) {
    throw new Error('Invalid file');
  }

  const { size } = file;

  // 20mb
  if (size > 20000000) {
    return 'Too large file';
  }

  // read file
  const buffer = await fs.readFileSync(file.path);

  // determine file type using magic numbers
  const ft = fileType(buffer);

  if (!ft) {
    return 'Invalid file';
  }

  const { mime } = ft;

  if (
    ![
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ].includes(mime)
  ) {
    return 'Invalid file';
  }

  return 'ok';
};

/**
 * Create AWS instance
 */
const createAWS = () => {
  const AWS_ACCESS_KEY_ID = getEnv({ name: 'AWS_ACCESS_KEY_ID' });
  const AWS_SECRET_ACCESS_KEY = getEnv({ name: 'AWS_SECRET_ACCESS_KEY' });
  const AWS_BUCKET = getEnv({ name: 'AWS_BUCKET' });
  const AWS_COMPATIBLE_SERVICE_ENDPOINT = getEnv({ name: 'AWS_COMPATIBLE_SERVICE_ENDPOINT' });
  const AWS_FORCE_PATH_STYLE = getEnv({ name: 'AWS_FORCE_PATH_STYLE' });

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET) {
    throw new Error('AWS credentials are not configured');
  }

  const options: { accessKeyId: string; secretAccessKey: string; endpoint?: string; s3ForcePathStyle?: boolean } = {
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
const createGCS = () => {
  const GOOGLE_APPLICATION_CREDENTIALS = getEnv({ name: 'GOOGLE_APPLICATION_CREDENTIALS' });
  const GOOGLE_PROJECT_ID = getEnv({ name: 'GOOGLE_PROJECT_ID' });
  const BUCKET = getEnv({ name: 'GOOGLE_CLOUD_STORAGE_BUCKET' });

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
 * Save binary data to amazon s3
 */
export const uploadFileAWS = async (file: { name: string; path: string }): Promise<string> => {
  const AWS_BUCKET = getEnv({ name: 'AWS_BUCKET' });
  const AWS_PREFIX = getEnv({ name: 'AWS_PREFIX', defaultValue: '' });
  const IS_PUBLIC = getEnv({ name: 'FILE_SYSTEM_PUBLIC', defaultValue: 'true' });

  // initialize s3
  const s3 = createAWS();

  // generate unique name
  const fileName = `${AWS_PREFIX}${Math.random()}${file.name}`;

  // read file
  const buffer = await fs.readFileSync(file.path);

  // upload to s3
  const response: any = await new Promise((resolve, reject) => {
    s3.upload(
      {
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
export const uploadFileGCS = async (file: { name: string; path: string; type: string }): Promise<string> => {
  const BUCKET = getEnv({ name: 'GOOGLE_CLOUD_STORAGE_BUCKET' });
  const IS_PUBLIC = getEnv({ name: 'FILE_SYSTEM_PUBLIC', defaultValue: 'true' });

  // initialize GCS
  const storage = createGCS();

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

/**
 * Read file from GCS, AWS
 */
export const readFileRequest = async (key: string): Promise<any> => {
  const UPLOAD_SERVICE_TYPE = getEnv({ name: 'UPLOAD_SERVICE_TYPE', defaultValue: 'AWS' });

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    const GCS_BUCKET = getEnv({ name: 'GOOGLE_CLOUD_STORAGE_BUCKET' });
    const storage = createGCS();

    const bucket = storage.bucket(GCS_BUCKET);

    const file = bucket.file(key);

    // get a file buffer
    const [contents] = await file.download({});

    return contents;
  }

  const AWS_BUCKET = getEnv({ name: 'AWS_BUCKET' });
  const s3 = createAWS();

  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: AWS_BUCKET,
        Key: key,
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response.Body);
      },
    );
  });
};

/*
 * Save binary data to amazon s3
 */
export const uploadFile = async (file, fromEditor = false): Promise<any> => {
  const IS_PUBLIC = getEnv({ name: 'FILE_SYSTEM_PUBLIC', defaultValue: 'true' });
  const DOMAIN = getEnv({ name: 'DOMAIN' });
  const UPLOAD_SERVICE_TYPE = getEnv({ name: 'UPLOAD_SERVICE_TYPE', defaultValue: 'AWS' });

  const nameOrLink = UPLOAD_SERVICE_TYPE === 'AWS' ? await uploadFileAWS(file) : await uploadFileGCS(file);

  if (fromEditor) {
    const editorResult = { fileName: file.name, uploaded: 1, url: nameOrLink };

    if (IS_PUBLIC !== 'true') {
      editorResult.url = `${DOMAIN}/read-file?key=${nameOrLink}`;
    }

    return editorResult;
  }

  return nameOrLink;
};

/**
 * Read contents of a file
 */
export const readFile = (filename: string) => {
  const filePath = `${__dirname}/../private/emailTemplates/${filename}.html`;

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

/**
 * Create default or ses transporter
 */
export const createTransporter = ({ ses }) => {
  if (ses) {
    const AWS_SES_ACCESS_KEY_ID = getEnv({ name: 'AWS_SES_ACCESS_KEY_ID' });
    const AWS_SES_SECRET_ACCESS_KEY = getEnv({ name: 'AWS_SES_SECRET_ACCESS_KEY' });
    const AWS_REGION = getEnv({ name: 'AWS_REGION' });

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' }),
    });
  }

  const MAIL_SERVICE = getEnv({ name: 'MAIL_SERVICE' });
  const MAIL_PORT = getEnv({ name: 'MAIL_PORT' });
  const MAIL_USER = getEnv({ name: 'MAIL_USER' });
  const MAIL_PASS = getEnv({ name: 'MAIL_PASS' });
  const MAIL_HOST = getEnv({ name: 'MAIL_HOST' });

  return nodemailer.createTransport({
    service: MAIL_SERVICE,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });
};

/**
 * Send email
 */
export const sendEmail = async ({
  toEmails,
  fromEmail,
  title,
  template = {},
}: {
  toEmails?: string[];
  fromEmail?: string;
  title?: string;
  template?: { name?: string; data?: any; isCustom?: boolean };
}) => {
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const DEFAULT_EMAIL_SERVICE = getEnv({ name: 'DEFAULT_EMAIL_SERVICE', defaultValue: '' });
  const COMPANY_EMAIL_FROM = getEnv({ name: 'COMPANY_EMAIL_FROM' });

  // do not send email it is running in test mode
  if (NODE_ENV === 'test') {
    return;
  }

  // try to create transporter or throw configuration error
  let transporter;

  try {
    transporter = createTransporter({ ses: DEFAULT_EMAIL_SERVICE === 'SES' });
  } catch (e) {
    return debugEmail(e.message);
  }

  const { isCustom, data, name } = template;

  // generate email content by given template
  let html = await applyTemplate(data, name || '');

  if (!isCustom) {
    html = await applyTemplate({ content: html }, 'base');
  }

  return (toEmails || []).map(toEmail => {
    const mailOptions = {
      from: fromEmail || COMPANY_EMAIL_FROM,
      to: toEmail,
      subject: title,
      html,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      debugEmail(error);
      debugEmail(info);
    });
  });
};

/**
 * Returns user's name or email
 */
export const getUserDetail = (user: IUser) => {
  return (user.details && user.details.fullName) || user.email;
};

export interface ISendNotification {
  createdUser: IUserDocument;
  receivers: string[];
  title: string;
  content: string;
  notifType: string;
  link: string;
  action: string;
  contentType: string;
  contentTypeId: string;
}

/**
 * Send a notification
 */
export const sendNotification = async (doc: ISendNotification) => {
  const { createdUser, receivers, title, content, notifType, action, contentType, contentTypeId } = doc;
  let link = doc.link;

  // collecting emails
  const recipients = await Users.find({ _id: { $in: receivers } });

  // collect recipient emails
  const toEmails: string[] = [];

  for (const recipient of recipients) {
    if (recipient.getNotificationByEmail && recipient.email) {
      toEmails.push(recipient.email);
    }
  }

  // loop through receiver ids
  for (const receiverId of receivers) {
    try {
      // send web and mobile notification
      const notification = await Notifications.createNotification(
        { link, title, content, notifType, receiver: receiverId, action, contentType, contentTypeId },
        createdUser._id,
      );

      graphqlPubsub.publish('notificationInserted', {
        notificationInserted: {
          userId: receiverId,
          title: notification.title,
          content: notification.content,
        },
      });
    } catch (e) {
      // Any other error is serious
      if (e.message !== 'Configuration does not exist') {
        throw e;
      }
    }
  }

  const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  link = `${MAIN_APP_DOMAIN}${link}`;

  await sendEmail({
    toEmails,
    title: 'Notification',
    template: {
      name: 'notification',
      data: {
        notification: { ...doc, link },
        action,
        userName: getUserDetail(createdUser),
      },
    },
  });

  return true;
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

interface IRequestParams {
  url?: string;
  path?: string;
  method?: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: string };
  body?: { [key: string]: string };
  form?: { [key: string]: string };
}

export interface ILogQueryParams {
  start?: string;
  end?: string;
  userId?: string;
  action?: string;
  page?: number;
  perPage?: number;
}

interface ILogParams {
  type: string;
  newData?: string;
  description?: string;
  object: any;
}

/**
 * Sends post request to specific url
 */
export const sendRequest = async (
  { url, method, headers, form, body, params }: IRequestParams,
  errorMessage?: string,
) => {
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  if (NODE_ENV === 'test') {
    return;
  }

  debugExternalApi(`
    Sending request to
    url: ${url}
    method: ${method}
    body: ${JSON.stringify(body)}
    params: ${JSON.stringify(params)}
  `);

  try {
    const response = await requestify.request(url, {
      method,
      headers: { 'Content-Type': 'application/json', origin: DOMAIN, ...(headers || {}) },
      form,
      body,
      params,
    });

    const responseBody = response.getBody();

    debugExternalApi(`
      Success from : ${url}
      responseBody: ${JSON.stringify(responseBody)}
    `);

    return responseBody;
  } catch (e) {
    if (e.code === 'ECONNREFUSED') {
      throw new Error(errorMessage);
    } else {
      const message = e.body || e.message;
      throw new Error(message);
    }
  }
};

/**
 * Send request to crons api
 */
export const fetchCronsApi = ({ path, method, body, params }: IRequestParams) => {
  const CRONS_API_DOMAIN = getEnv({ name: 'CRONS_API_DOMAIN' });

  return sendRequest(
    { url: `${CRONS_API_DOMAIN}${path}`, method, body, params },
    'Failed to connect crons api. Check CRONS_API_DOMAIN env or crons api is not running',
  );
};

/**
 * Send request to workers api
 */
export const fetchWorkersApi = ({ path, method, body, params }: IRequestParams) => {
  const WORKERS_API_DOMAIN = getEnv({ name: 'WORKERS_API_DOMAIN' });

  return sendRequest(
    { url: `${WORKERS_API_DOMAIN}${path}`, method, body, params },
    'Failed to connect workers api. Check WORKERS_API_DOMAIN env or workers api is not running',
  );
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putCreateLog = (params: ILogParams, user: IUserDocument) => {
  const doc = { ...params, action: 'create', object: JSON.stringify(params.object) };

  return putLog(doc, user);
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putUpdateLog = (params: ILogParams, user: IUserDocument) => {
  const doc = { ...params, action: 'update', object: JSON.stringify(params.object) };

  return putLog(doc, user);
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putDeleteLog = (params: ILogParams, user: IUserDocument) => {
  const doc = { ...params, action: 'delete', object: JSON.stringify(params.object) };

  return putLog(doc, user);
};

/**
 * Sends a request to logs api
 * @param {Object} body Request
 * @param {Object} user User information from mutation context
 */
const putLog = (body: ILogParams, user: IUserDocument) => {
  const LOGS_DOMAIN = getEnv({ name: 'LOGS_API_DOMAIN' });

  if (!LOGS_DOMAIN) {
    return;
  }

  const doc = {
    ...body,
    createdBy: user._id,
    unicode: user.username || user.email || user._id,
  };

  return sendRequest(
    { url: `${LOGS_DOMAIN}/logs/create`, method: 'post', body: { params: JSON.stringify(doc) } },
    'Failed to connect to logs api. Check whether LOGS_API_DOMAIN env is missing or logs api is not running',
  );
};

/**
 * Sends a request to logs api
 * @param {Object} param0 Request
 */
export const fetchLogs = (params: ILogQueryParams) => {
  const LOGS_DOMAIN = getEnv({ name: 'LOGS_API_DOMAIN' });

  if (!LOGS_DOMAIN) {
    return {
      logs: [],
      totalCount: 0,
    };
  }

  return sendRequest(
    { url: `${LOGS_DOMAIN}/logs`, method: 'get', body: { params: JSON.stringify(params) } },
    'Failed to connect to logs api. Check whether LOGS_API_DOMAIN env is missing or logs api is not running',
  );
};

/**
 * Validates email using MX record resolver
 * @param email as String
 */
export const validateEmail = async email => {
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  if (NODE_ENV === 'test') {
    return true;
  }

  const emailValidator = new EmailValidator();
  const { validDomain, validMailbox } = await emailValidator.verify(email);

  if (!validDomain) {
    return false;
  }

  if (!validMailbox && validMailbox === null) {
    return false;
  }

  return true;
};

export const authCookieOptions = () => {
  const oneDay = 1 * 24 * 3600 * 1000; // 1 day

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    maxAge: oneDay,
    secure: false,
  };

  const HTTPS = getEnv({ name: 'HTTPS', defaultValue: 'false' });

  if (HTTPS === 'true') {
    cookieOptions.secure = true;
  }

  return cookieOptions;
};

export const getEnv = ({ name, defaultValue }: { name: string; defaultValue?: string }): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  return value || '';
};

/**
 * Send notification to mobile device from inbox conversations
 * @param {string} - title
 * @param {string} - body
 * @param {string} - customerId
 * @param {array} - receivers
 */
export const sendMobileNotification = async ({
  receivers,
  title,
  body,
  customerId,
  conversationId,
}: {
  receivers: string[];
  customerId?: string;
  title: string;
  body: string;
  conversationId: string;
}): Promise<void> => {
  if (!admin.apps.length) {
    return;
  }

  const transporter = admin.messaging();
  const tokens: string[] = [];

  if (receivers) {
    tokens.push(...(await Users.find({ _id: { $in: receivers } }).distinct('deviceTokens')));
  }

  if (customerId) {
    tokens.push(...(await Customers.findOne({ _id: customerId }).distinct('deviceTokens')));
  }

  if (tokens.length > 0) {
    // send notification
    for (const token of tokens) {
      await transporter.send({ token, notification: { title, body }, data: { conversationId } });
    }
  }
};

export const paginate = (collection, params: { ids?: string[]; page?: number; perPage?: number }) => {
  const { page = 0, perPage = 0, ids } = params || { ids: null };

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  if (ids) {
    return collection;
  }

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */
export const fixDate = (value, defaultValue = new Date()): Date => {
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date;
  }

  return defaultValue;
};

export const getDate = (date: Date, day: number): Date => {
  const currentDate = new Date();

  date.setDate(currentDate.getDate() + day + 1);
  date.setHours(0, 0, 0, 0);

  return date;
};

export const getToday = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};

export const getNextMonth = (date: Date): { start: number; end: number } => {
  const today = getToday(date);

  const month = (new Date().getMonth() + 1) % 12;
  const start = today.setMonth(month, 1);
  const end = today.setMonth(month + 1, 0);

  return { start, end };
};

export default {
  sendEmail,
  validateEmail,
  sendNotification,
  sendMobileNotification,
  readFile,
  createTransporter,
};
