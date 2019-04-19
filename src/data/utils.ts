import * as AWS from 'aws-sdk';
import * as EmailValidator from 'email-deep-validator';
import * as fileType from 'file-type';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as requestify from 'requestify';
import * as xlsxPopulate from 'xlsx-populate';
import { Companies, Customers, Notifications, Users } from '../db/models';
import { IUserDocument } from '../db/models/definitions/users';
import { can } from './permissions/utils';

/*
 * Check that given file is not harmful
 */
export const checkFile = async file => {
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

/*
 * Save binary data to amazon s3
 */
export const uploadFile = async (file: { name: string; path: string }): Promise<string> => {
  const AWS_ACCESS_KEY_ID = getEnv({ name: 'AWS_ACCESS_KEY_ID' });
  const AWS_SECRET_ACCESS_KEY = getEnv({ name: 'AWS_SECRET_ACCESS_KEY' });
  const AWS_BUCKET = getEnv({ name: 'AWS_BUCKET' });
  const AWS_PREFIX = getEnv({ name: 'AWS_PREFIX', defaultValue: '' });

  // initialize s3
  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

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
        ACL: 'public-read',
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      },
    );
  });

  return response.Location;
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
    return console.log(e.message); // eslint-disable-line
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
      console.log(error); // eslint-disable-line
      console.log(info); // eslint-disable-line
    });
  });
};

/**
 * Send a notification
 */
export const sendNotification = async ({
  createdUser,
  receivers,
  ...doc
}: {
  createdUser: string;
  receivers: string[];
  title: string;
  content: string;
  notifType: string;
  link: string;
}) => {
  const createdUserObj = await Users.findOne({ _id: createdUser });

  if (!createdUserObj) {
    throw new Error('Created user not found');
  }

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
      await Notifications.createNotification({ ...doc, receiver: receiverId }, createdUser);
    } catch (e) {
      // Any other error is serious
      if (e.message !== 'Configuration does not exist') {
        throw e;
      }
    }
  }

  return sendEmail({
    toEmails,
    title: 'Notification',
    template: {
      name: 'notification',
      data: {
        notification: doc,
      },
    },
  });
};

/**
 * Receives and saves xls file in private/xlsImports folder
 * and imports customers to the database
 */
export const importXlsFile = async (file: any, type: string, { user }: { user: IUserDocument }) => {
  return new Promise(async (resolve, reject) => {
    if (!(await can('importXlsFile', user._id))) {
      return reject('Permission denied!');
    }

    const readStream = fs.createReadStream(file.path);

    // Directory to save file
    const downloadDir = `${__dirname}/../private/xlsTemplateOutputs/${file.name}`;

    // Converting pipe into promise
    const pipe = stream =>
      new Promise((resolver, rejecter) => {
        stream.on('finish', resolver);
        stream.on('error', rejecter);
      });

    // Creating streams
    const writeStream = fs.createWriteStream(downloadDir);
    const streamObj = readStream.pipe(writeStream);

    pipe(streamObj)
      .then(async () => {
        // After finished saving instantly create and load workbook from xls
        const workbook = await xlsxPopulate.fromFileAsync(downloadDir);

        // Deleting file after read
        fs.unlink(downloadDir, () => {
          return true;
        });

        const usedRange = workbook.sheet(0).usedRange();

        if (!usedRange) {
          return reject(['Invalid file']);
        }

        const usedSheets = usedRange.value();

        // Getting columns
        const fieldNames = usedSheets[0];

        let collection;

        // Removing column
        usedSheets.shift();

        switch (type) {
          case 'customers':
            collection = Customers;
            break;

          case 'companies':
            collection = Companies;
            break;

          default:
            reject(['Invalid import type']);
        }

        const response = await collection.bulkInsert(fieldNames, usedSheets, user);

        resolve(response);
      })
      .catch(e => {
        reject(e);
      });
  });
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
export const generateXlsx = async (workbook: any, name: string): Promise<string> => {
  // Url to download xls file
  const url = `xlsTemplateOutputs/${name}.xlsx`;
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  // Saving xls workbook to the directory
  await workbook.toFileAsync(`${__dirname}/../private/${url}`);

  return `${DOMAIN}/static/${url}`;
};
/**
 * Sends post request to specific url
 */
export const sendPostRequest = (url: string, params: { [key: string]: string }) =>
  requestify.request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { ...params },
  });

/**
 * Validates email using MX record resolver
 * @param email as String
 */
export const validateEmail = async email => {
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

  if (!value) {
    console.log(`Missing environment variable configuration for ${name}`);
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
}: {
  receivers: string[];
  customerId?: string;
  title: string;
  body: string;
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
      await transporter.send({ token, notification: { title, body } });
    }
  }
};

export default {
  sendEmail,
  validateEmail,
  sendNotification,
  sendMobileNotification,
  readFile,
  createTransporter,
};
