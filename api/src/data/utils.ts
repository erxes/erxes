import * as AWS from 'aws-sdk';
import * as fileType from 'file-type';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as requestify from 'requestify';
import * as strip from 'strip';
import * as xlsxPopulate from 'xlsx-populate';
import {
  Configs,
  Customers,
  EmailDeliveries,
  Notifications,
  Users,
  Webhooks
} from '../db/models';
import { IBrandDocument } from '../db/models/definitions/brands';
import { WEBHOOK_STATUS } from '../db/models/definitions/constants';
import { ICustomer } from '../db/models/definitions/customers';
import { EMAIL_DELIVERY_STATUS } from '../db/models/definitions/emailDeliveries';
import { IUser, IUserDocument } from '../db/models/definitions/users';
import { OnboardingHistories } from '../db/models/Robot';
import { debugBase, debugEmail, debugExternalApi } from '../debuggers';
import memoryStorage from '../inmemoryStorage';
import { graphqlPubsub } from '../pubsub';
import { fieldsCombinedByContentType } from './modules/fields/utils';

export const uploadsFolderPath = path.join(__dirname, '../private/uploads');

export const initFirebase = (code: string): void => {
  if (code.length === 0) {
    return;
  }

  const codeString = code.trim();

  if (codeString[0] === '{' && codeString[codeString.length - 1] === '}') {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  }
};

/*
 * Check that given file is not harmful
 */
export const checkFile = async (file, source?: string) => {
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
    'application/vnd.ms-excel'
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
    source === 'widgets' ? 'WIDGETS_UPLOAD_FILE_TYPES' : 'UPLOAD_FILE_TYPES'
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
const createAWS = async () => {
  const AWS_ACCESS_KEY_ID = await getConfig('AWS_ACCESS_KEY_ID');
  const AWS_SECRET_ACCESS_KEY = await getConfig('AWS_SECRET_ACCESS_KEY');
  const AWS_BUCKET = await getConfig('AWS_BUCKET');
  const AWS_COMPATIBLE_SERVICE_ENDPOINT = await getConfig(
    'AWS_COMPATIBLE_SERVICE_ENDPOINT'
  );
  const AWS_FORCE_PATH_STYLE = await getConfig('AWS_FORCE_PATH_STYLE');

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
const createGCS = async () => {
  const GOOGLE_APPLICATION_CREDENTIALS = await getConfig(
    'GOOGLE_APPLICATION_CREDENTIALS'
  );
  const GOOGLE_PROJECT_ID = await getConfig('GOOGLE_PROJECT_ID');
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET');

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
  forcePrivate: boolean = false
): Promise<string> => {
  const IS_PUBLIC = forcePrivate
    ? false
    : await getConfig('FILE_SYSTEM_PUBLIC', 'true');
  const AWS_PREFIX = await getConfig('AWS_PREFIX');
  const AWS_BUCKET = await getConfig('AWS_BUCKET');

  // initialize s3
  const s3 = await createAWS();

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
export const deleteFileAWS = async (fileName: string) => {
  const AWS_BUCKET = await getConfig('AWS_BUCKET');

  const params = { Bucket: AWS_BUCKET, Key: fileName };

  // initialize s3
  const s3 = await createAWS();

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
export const uploadFileGCS = async (file: {
  name: string;
  path: string;
  type: string;
}): Promise<string> => {
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET');
  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC');

  // initialize GCS
  const storage = await createGCS();

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

const deleteFileGCS = async (fileName: string) => {
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET');

  // initialize GCS
  const storage = await createGCS();

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
export const readFileRequest = async (key: string): Promise<any> => {
  const UPLOAD_SERVICE_TYPE = await getConfig('UPLOAD_SERVICE_TYPE', 'AWS');

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    const GCS_BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET');
    const storage = await createGCS();

    const bucket = storage.bucket(GCS_BUCKET);

    const file = bucket.file(key);

    // get a file buffer
    const [contents] = await file.download({});

    return contents;
  }

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    const AWS_BUCKET = await getConfig('AWS_BUCKET');
    const s3 = await createAWS();

    return new Promise((resolve, reject) => {
      s3.getObject(
        {
          Bucket: AWS_BUCKET,
          Key: key
        },
        (error, response) => {
          if (error) {
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
  fromEditor = false
): Promise<any> => {
  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC');
  const UPLOAD_SERVICE_TYPE = await getConfig('UPLOAD_SERVICE_TYPE', 'AWS');

  let nameOrLink = '';

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    nameOrLink = await uploadFileAWS(file);
  }

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    nameOrLink = await uploadFileGCS(file);
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

export const deleteFile = async (fileName: string): Promise<any> => {
  const UPLOAD_SERVICE_TYPE = await getConfig('UPLOAD_SERVICE_TYPE', 'AWS');

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    return deleteFileAWS(fileName);
  }

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    return deleteFileGCS(fileName);
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    return deleteFileLocal(fileName);
  }
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
export const createTransporter = async ({ ses }) => {
  if (ses) {
    const AWS_SES_ACCESS_KEY_ID = await getConfig('AWS_SES_ACCESS_KEY_ID');
    const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
      'AWS_SES_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = await getConfig('AWS_REGION');

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' })
    });
  }

  const MAIL_SERVICE = await getConfig('MAIL_SERVICE');
  const MAIL_PORT = await getConfig('MAIL_PORT');
  const MAIL_USER = await getConfig('MAIL_USER');
  const MAIL_PASS = await getConfig('MAIL_PASS');
  const MAIL_HOST = await getConfig('MAIL_HOST');

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

interface IReplacer {
  key: string;
  value: string;
}

/**
 * Replace editor dynamic content tags
 */
export const replaceEditorAttributes = async (args: {
  content: string;
  customer?: ICustomer;
  user?: IUser;
  customerFields?: string[];
  brand?: IBrandDocument;
}): Promise<{
  replacers: IReplacer[];
  replacedContent?: string;
  customerFields?: string[];
}> => {
  const { content, customer, user, brand } = args;

  const replacers: IReplacer[] = [];

  let replacedContent = content || '';
  let customerFields = args.customerFields;

  if (!customerFields || customerFields.length === 0) {
    const possibleCustomerFields = await fieldsCombinedByContentType({
      contentType: 'customer'
    });

    customerFields = ['firstName', 'lastName'];

    for (const field of possibleCustomerFields) {
      if (content.includes(`{{ customer.${field.name} }}`)) {
        if (field.name.includes('trackedData')) {
          customerFields.push('trackedData');
          continue;
        }

        if (field.name.includes('customFieldsData')) {
          customerFields.push('customFieldsData');
          continue;
        }

        customerFields.push(field.name);
      }
    }
  }

  // replace customer fields
  if (customer) {
    replacers.push({
      key: '{{ customer.name }}',
      value: Customers.getCustomerName(customer)
    });

    for (const field of customerFields) {
      if (field.includes('trackedData') || field.includes('customFieldsData')) {
        const dbFieldName = field.includes('trackedData')
          ? 'trackedData'
          : 'customFieldsData';

        for (const subField of customer[dbFieldName] || []) {
          replacers.push({
            key: `{{ customer.${dbFieldName}.${subField.field} }}`,
            value: subField.value || ''
          });
        }

        continue;
      }

      replacers.push({
        key: `{{ customer.${field} }}`,
        value: customer[field] || ''
      });
    }
  }

  // replace user fields
  if (user) {
    replacers.push({ key: '{{ user.email }}', value: user.email || '' });

    if (user.details) {
      replacers.push({
        key: '{{ user.fullName }}',
        value: user.details.fullName || ''
      });
      replacers.push({
        key: '{{ user.position }}',
        value: user.details.position || ''
      });
    }
  }

  // replace brand fields
  if (brand) {
    replacers.push({ key: '{{ brandName }}', value: brand.name || '' });
  }

  for (const replacer of replacers) {
    const regex = new RegExp(replacer.key, 'gi');

    replacedContent = replacedContent.replace(regex, replacer.value);
  }

  return { replacedContent, replacers, customerFields };
};

/**
 * Send email
 */
export const sendEmail = async (params: IEmailParams) => {
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
  const DEFAULT_EMAIL_SERVICE = await getConfig('DEFAULT_EMAIL_SERVICE', 'SES');
  const COMPANY_EMAIL_FROM = await getConfig('COMPANY_EMAIL_FROM', '');
  const AWS_SES_CONFIG_SET = await getConfig('AWS_SES_CONFIG_SET', '');
  const AWS_ACCESS_KEY_ID = await getConfig('AWS_ACCESS_KEY_ID', '');
  const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
    'AWS_SES_SECRET_ACCESS_KEY',
    ''
  );
  const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  // do not send email it is running in test mode
  if (NODE_ENV === 'test') {
    return;
  }

  // try to create transporter or throw configuration error
  let transporter;

  try {
    transporter = await createTransporter({
      ses: DEFAULT_EMAIL_SERVICE === 'SES'
    });
  } catch (e) {
    return debugEmail(e.message);
  }

  const { data = {}, name } = template;

  // for unsubscribe url
  data.domain = MAIN_APP_DOMAIN;

  for (const toEmail of toEmails) {
    if (modifier) {
      modifier(data, toEmail);
    }

    // generate email content by given template
    let html = await applyTemplate(data, name || 'base');

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

    let headers: { [key: string]: string } = {};

    if (AWS_ACCESS_KEY_ID.length > 0 && AWS_SES_SECRET_ACCESS_KEY.length > 0) {
      const emailDelivery = await EmailDeliveries.create({
        kind: 'transaction',
        to: toEmail,
        from: fromEmail || COMPANY_EMAIL_FROM,
        subject: title,
        body: html,
        status: EMAIL_DELIVERY_STATUS.PENDING
      });

      headers = {
        'X-SES-CONFIGURATION-SET': AWS_SES_CONFIG_SET || 'erxes',
        EmailDeliveryId: emailDelivery._id
      };
    } else {
      headers['X-SES-CONFIGURATION-SET'] = 'erxes';
    }

    mailOptions.headers = headers;

    return transporter.sendMail(mailOptions, (error, info) => {
      debugEmail(error);
      debugEmail(info);
    });
  }
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
  const {
    createdUser,
    receivers,
    title,
    content,
    notifType,
    action,
    contentType,
    contentTypeId
  } = doc;
  let link = doc.link;

  // remove duplicated ids
  const receiverIds = [...new Set(receivers)];

  // collecting emails
  const recipients = await Users.find({
    _id: { $in: receiverIds },
    isActive: true,
    doNotDisturb: { $ne: 'Yes' }
  });

  // collect recipient emails
  const toEmails: string[] = [];

  for (const recipient of recipients) {
    if (recipient.getNotificationByEmail && recipient.email) {
      toEmails.push(recipient.email);
    }
  }

  // loop through receiver ids
  for (const receiverId of receiverIds) {
    try {
      // send web and mobile notification
      const notification = await Notifications.createNotification(
        {
          link,
          title,
          content,
          notifType,
          receiver: receiverId,
          action,
          contentType,
          contentTypeId
        },
        createdUser._id
      );

      graphqlPubsub.publish('notificationInserted', {
        notificationInserted: {
          _id: notification._id,
          userId: receiverId,
          title: notification.title,
          content: notification.content
        }
      });
    } catch (e) {
      // Any other error is serious
      if (e.message !== 'Configuration does not exist') {
        throw e;
      }
    }
  } // end receiverIds loop

  const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  link = `${MAIN_APP_DOMAIN}${link}`;

  // for controlling email template data filling
  const modifier = (data: any, email: string) => {
    const user = recipients.find(item => item.email === email);

    if (user) {
      data.uid = user._id;
    }
  };

  await sendEmail({
    toEmails,
    title: 'Notification',
    template: {
      name: 'notification',
      data: {
        notification: { ...doc, link },
        action,
        userName: getUserDetail(createdUser)
      }
    },
    modifier
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
  body?: { [key: string]: any };
  form?: { [key: string]: string };
}

/**
 * Sends post request to specific url
 */
export const sendRequest = async (
  { url, method, headers, form, body, params }: IRequestParams,
  errorMessage?: string
) => {
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
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      form,
      body,
      params
    });

    const responseBody = response.getBody();

    debugExternalApi(`
      Success from : ${url}
      responseBody: ${JSON.stringify(responseBody)}
    `);

    return responseBody;
  } catch (e) {
    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      throw new Error(errorMessage);
    } else {
      const message = e.body || e.message;
      throw new Error(message);
    }
  }
};

export const registerOnboardHistory = ({
  type,
  user
}: {
  type: string;
  user: IUserDocument;
}) =>
  OnboardingHistories.getOrCreate({ type, user })
    .then(({ status }) => {
      if (status === 'created') {
        graphqlPubsub.publish('onboardingChanged', {
          onboardingChanged: { userId: user._id, type }
        });
      }
    })
    .catch(e => debugBase(e));

export const authCookieOptions = (secure: boolean) => {
  const oneDay = 1 * 24 * 3600 * 1000; // 1 day

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    maxAge: oneDay,
    secure
  };

  return cookieOptions;
};

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
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
  conversationId
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
    tokens.push(
      ...(await Users.find({ _id: { $in: receivers } }).distinct(
        'deviceTokens'
      ))
    );
  }

  if (customerId) {
    tokens.push(
      ...(await Customers.findOne({ _id: customerId }).distinct('deviceTokens'))
    );
  }

  if (tokens.length > 0) {
    // send notification
    for (const token of tokens) {
      await transporter.send({
        token,
        notification: { title, body },
        data: { conversationId }
      });
    }
  }
};

export const paginate = (
  collection,
  params: {
    ids?: string[];
    page?: number;
    perPage?: number;
    excludeIds?: boolean;
  }
) => {
  const { page = 0, perPage = 0, ids, excludeIds } = params || { ids: null };

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  if (ids && ids.length > 0) {
    return excludeIds ? collection.limit(_limit) : collection;
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
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0
    )
  );
};

export const getNextMonth = (date: Date): { start: number; end: number } => {
  const today = getToday(date);
  const currentMonth = new Date().getMonth();

  if (currentMonth === 11) {
    today.setFullYear(today.getFullYear() + 1);
  }

  const month = (currentMonth + 1) % 12;
  const start = today.setMonth(month, 1);
  const end = today.setMonth(month + 1, 0);

  return { start, end };
};

/**
 * Send to webhook
 */

export const sendToWebhook = async (
  action: string,
  type: string,
  params: any
) => {
  const webhooks = await Webhooks.find({
    'actions.action': action,
    'actions.type': type
  });

  if (!webhooks) {
    return;
  }

  let data = params;
  for (const webhook of webhooks) {
    if (!webhook.url || webhook.url.length === 0) {
      continue;
    }

    if (action === 'delete') {
      data = { type, object: { _id: params.object._id } };
    }

    sendRequest({
      url: webhook.url,
      headers: {
        'Erxes-token': webhook.token || ''
      },
      method: 'post',
      body: { data: JSON.stringify(data), action, type }
    })
      .then(async () => {
        await Webhooks.updateStatus(webhook._id, WEBHOOK_STATUS.AVAILABLE);
      })
      .catch(async () => {
        await Webhooks.updateStatus(webhook._id, WEBHOOK_STATUS.UNAVAILABLE);
      });
  }
};

export default {
  sendEmail,
  sendNotification,
  sendMobileNotification,
  readFile,
  createTransporter,
  sendToWebhook
};

export const cleanHtml = (content?: string) =>
  strip(content || '').substring(0, 100);

export const validSearchText = (values: string[]) => {
  const value = values.join(' ');

  if (value.length < 512) {
    return value;
  }

  return value.substring(0, 511);
};

const stringToRegex = (value: string) => {
  const specialChars = [...'{}[]\\^$.|?*+()'];

  const result = [...value].map(char =>
    specialChars.includes(char) ? '.?\\' + char : '.?' + char
  );

  return '.*' + result.join('').substring(2) + '.*';
};

export const regexSearchText = (
  searchValue: string,
  searchKey = 'searchText'
) => {
  const result: any[] = [];

  searchValue = searchValue.replace(/\s\s+/g, ' ');

  const words = searchValue.split(' ');

  for (const word of words) {
    result.push({ [searchKey]: new RegExp(`${stringToRegex(word)}`, 'mui') });
  }

  return { $and: result };
};

/**
 * Check user ids whether its added or removed from array of ids
 */
export const checkUserIds = (
  oldUserIds: string[] = [],
  newUserIds: string[] = []
) => {
  const removedUserIds = oldUserIds.filter(e => !newUserIds.includes(e));

  const addedUserIds = newUserIds.filter(e => !oldUserIds.includes(e));

  return { addedUserIds, removedUserIds };
};

/*
 * Handle engage unsubscribe request
 */
export const handleUnsubscription = async (query: {
  cid: string;
  uid: string;
}) => {
  const { cid, uid } = query;

  if (cid) {
    await Customers.updateOne({ _id: cid }, { $set: { doNotDisturb: 'Yes' } });
  }

  if (uid) {
    await Users.updateOne({ _id: uid }, { $set: { doNotDisturb: 'Yes' } });
  }
};

export const getConfigs = async () => {
  const configsCache = await memoryStorage().get('configs_erxes_api');

  if (configsCache && configsCache !== '{}') {
    return JSON.parse(configsCache);
  }

  const configsMap = {};
  const configs = await Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  memoryStorage().set('configs_erxes_api', JSON.stringify(configsMap));

  return configsMap;
};

export const getConfig = async (code, defaultValue?) => {
  const configs = await getConfigs();

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const resetConfigsCache = () => {
  memoryStorage().set('configs_erxes_api', '');
};

export const frontendEnv = ({
  name,
  req,
  requestInfo
}: {
  name: string;
  req?: any;
  requestInfo?: any;
}): string => {
  const cookies = req ? req.cookies : requestInfo.cookies;
  const keys = Object.keys(cookies);

  const envs: { [key: string]: string } = {};

  for (const key of keys) {
    envs[key.replace('REACT_APP_', '')] = cookies[key];
  }

  return envs[name];
};

export const getSubServiceDomain = ({ name }: { name: string }): string => {
  const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  const defaultMappings = {
    API_DOMAIN: `${MAIN_APP_DOMAIN}/api`,
    WIDGETS_DOMAIN: `${MAIN_APP_DOMAIN}/widgets`,
    INTEGRATIONS_API_DOMAIN: `${MAIN_APP_DOMAIN}/integrations`,
    LOGS_API_DOMAIN: `${MAIN_APP_DOMAIN}/logs`,
    ENGAGES_API_DOMAIN: `${MAIN_APP_DOMAIN}/engages`,
    VERIFIER_API_DOMAIN: `${MAIN_APP_DOMAIN}/verifier`
  };

  const domain = getEnv({ name });

  if (domain) {
    return domain;
  }

  return defaultMappings[name];
};

export const chunkArray = (myArray, chunkSize: number) => {
  let index = 0;

  const arrayLength = myArray.length;
  const tempArray: any[] = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    const myChunk = myArray.slice(index, index + chunkSize);

    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
};

/**
 * Create s3 stream for excel file
 */
export const s3Stream = async (
  key: string,
  errorCallback: (error: any) => void
): Promise<any> => {
  const AWS_BUCKET = await getConfig('AWS_BUCKET');

  const s3 = await createAWS();

  const stream = s3
    .getObject({ Bucket: AWS_BUCKET, Key: key })
    .createReadStream();

  stream.on('error', errorCallback);

  return stream;
};

export const getDashboardFile = async (dashboardId: string) => {
  const timeout = async ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const DASHBOARD_DOMAIN = getSubServiceDomain({ name: 'DASHBOARD_DOMAIN' });

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto(`${DASHBOARD_DOMAIN}/details/${dashboardId}?pdf=true`);
  await timeout(5000);

  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();

  return pdf;
};

export const getErxesSaasDomain = () => {
  const NODE_ENV = process.env.NODE_ENV;

  return NODE_ENV === 'production'
    ? 'https://erxes.io'
    : 'http://localhost:3500';
};
