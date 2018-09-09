import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as xlsxPopulate from 'xlsx-populate';
import { Companies, Customers, Notifications, Users } from '../db/models';
import { IUserDocument } from '../db/models/definitions/users';

/*
 * Save binary data to amazon s3
 */
export const uploadFile = async (file: { name: string; path: string }): Promise<string> => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET = '', AWS_PREFIX = '' } = process.env;

  // check credentials
  if (!(AWS_ACCESS_KEY_ID || AWS_SECRET_ACCESS_KEY || AWS_BUCKET)) {
    throw new Error('Security credentials are not configured');
  }

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
  const { MAIL_SERVICE, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;

  if (ses) {
    const { AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

    if (!AWS_SES_ACCESS_KEY_ID || !AWS_SES_SECRET_ACCESS_KEY) {
      throw new Error('Invalid SES configuration');
    }

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' }),
    });
  }

  if (!MAIL_SERVICE || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    throw new Error('Invalid mail service configuration');
  }

  return nodemailer.createTransport({
    service: MAIL_SERVICE,
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
  subject?: string;
  to?: string;
}) => {
  const { NODE_ENV, DEFAULT_EMAIL_SERVICE, COMPANY_EMAIL_FROM } = process.env;

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
      // send notification
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
  return new Promise((resolve, reject) => {
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
  const { DOMAIN } = process.env;

  // Saving xls workbook to the directory
  await workbook.toFileAsync(`${__dirname}/../private/${url}`);

  return `${DOMAIN}/static/${url}`;
};

export default {
  sendEmail,
  sendNotification,
  readFile,
  createTransporter,
};
