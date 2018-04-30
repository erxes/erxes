import xlsxPopulate from 'xlsx-populate';
import AWS from 'aws-sdk';
import fs from 'fs';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { Notifications, Users } from '../db/models';

/*
 * Save binary data to amazon s3
 * @param {String} name - File name
 * @param {Object} data - File binary data
 * @return {String} - Uploaded file url
 */
export const uploadFile = async file => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET, AWS_PREFIX = '' } = process.env;

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
  const response = await new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: AWS_BUCKET,
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      },
    );
  });

  return response.Location;
};

/**
 * Read contents of a file
 * @param {string} filename - relative file path
 * @return {Promise} returns promise resolving file contents
 */
export const readFile = filename => {
  const filePath = `${__dirname}/../private/emailTemplates/${filename}.html`;

  return fs.readFileSync(filePath, 'utf8');
};

/**
 * SendEmail template helper
 * @param {Object} data data
 * @param {String} templateName
 * @return email with template as text
 */
const applyTemplate = async (data, templateName) => {
  let template = await readFile(templateName);

  template = Handlebars.compile(template.toString());

  return template(data);
};

/**
 * Create transporter
 * @return nodemailer transporter
*/
export const createTransporter = async () => {
  const { MAIL_SERVICE, MAIL_USER, MAIL_PASS } = process.env;

  return nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });
};

/**
 * Send email
 * @param {Array} args.toEmails
 * @param {String} args.fromEmail
 * @param {String} args.title
 * @param {String} args.templateArgs.name
 * @param {Object} args.templateArgs.data
 * @param {Boolean} args.templateArgs.isCustom
 * @return {Promise}
*/
export const sendEmail = async ({ toEmails, fromEmail, title, template }) => {
  const { NODE_ENV } = process.env;

  // do not send email it is running in test mode
  if (NODE_ENV == 'test') {
    return;
  }

  const transporter = await createTransporter();

  const { isCustom, data, name } = template;

  // generate email content by given template
  let html = await applyTemplate(data, name);

  if (!isCustom) {
    html = await applyTemplate({ content: html }, 'base');
  }

  return toEmails.map(toEmail => {
    const mailOptions = {
      from: fromEmail,
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
 * @param {String} doc.notifType
 * @param {String} doc.createdUser
 * @param {String} doc.title
 * @param {String} doc.content
 * @param {String} doc.link
 * @param {Array} doc.receivers Array of user ids
 * @return {Promise}
 */
export const sendNotification = async ({ createdUser, receivers, ...doc }) => {
  // collecting emails
  const recipients = await Users.find({ _id: { $in: receivers } });

  // collect recipient emails
  const toEmails = recipients.map(
    recipient => !(recipient.details && recipient.details.getNotificationByEmail === false),
  );

  // loop through receiver ids
  for (const receiverId of receivers) {
    doc.receiver = receiverId;

    try {
      // send notification
      await Notifications.createNotification(doc, createdUser);
    } catch (e) {
      // Any other error is serious
      if (e.message != 'Configuration does not exist') {
        throw e;
      }
    }
  }

  return sendEmail({
    toEmails,
    fromEmail: 'no-reply@erxes.io',
    title: 'Notification',
    template: {
      name: 'notification',
      data: {
        notification: doc,
      },
    },
  });
};

export const importXlsFile = file => {
  const readStream = fs.createReadStream(file.path);

  const downloadDir = `${__dirname}/../private/xlsImports/${file.name}`;

  const writeStream = fs.createWriteStream(downloadDir);
  const pipe = readStream.pipe(writeStream);

  pipe.on('finish', async () => {
    const workbook = await xlsxPopulate.fromFileAsync(downloadDir);

    importCustomers(workbook.sheet(0));

    return file.name;
  });
};

const importCustomers = sheet => {
  const rows = sheet.usedRange().value();
  const customers = [];

  rows.forEach(row => {
    const customer = {
      firstName: row[0] || '',
      lastName: row[1] || '',
      email: row[2] || '',
      phone: row[3] || 0,
      position: row[4] || '',
      department: row[5] || '',
      leadStatus: row[6] || '',
      lifecycleState: row[7] || '',
      hasAuthority: row[8] || 'No',
      description: row[9] || '',
      doNotDisturb: row[10] || 'No',
    };

    customers.push(customer);
  });

  // for(let customer of customers) {
  //   Customers.createCustomer(customer);
  // }
};

export const readTemplate = async name => {
  const workbook = await xlsxPopulate.fromFileAsync(
    `${__dirname}/../private/xlsTemplates/${name}.xlsx`,
  );

  return { workbook, sheet: workbook.sheet(0) };
};

export const generateXlsx = async (workbook, name) => {
  const url = `xlsTemplateOutputs/${name}.xlsx`;
  const { DOMAIN } = process.env;

  await workbook.toFileAsync(`${__dirname}/../private/${url}`);

  return `${DOMAIN}:3300/static/${url}`;
};

export default {
  sendEmail,
  sendNotification,
  readFile,
  createTransporter,
};
