import fs from 'fs';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { Notifications, Users } from '../db/models';
import { CUSTOMER_CONTENT_TYPES } from './constants';

/**
 * Read contents of a file
 * @param {string} filename - relative file path
 * @return {Promise} returns promise resolving file contents
 */
export const readFile = filename => {
  const filePath = `${__dirname}/../private/emailTemplates/${filename}.html`;

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
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

const START_DATE = {
  year: 2017,
  month: 0,
};

class BaseMonthActivityBuilder {
  constructor(customer) {
    this.customer = customer;
  }

  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  generateDates() {
    const now = new Date();

    const endYear = now.getFullYear();
    const endMonth = now.getMonth();

    const monthIntervals = [];

    for (
      let year = START_DATE.year, month = START_DATE.month;
      year < endYear || (year === endYear && month <= endMonth);
      month++
    ) {
      monthIntervals.push({
        yearMonth: {
          year,
          month,
        },
        interval: {
          start: new Date(year, month, 1),
          end: new Date(year, month, this.getDaysInMonth(year, month)),
        },
      });

      if ((month + 1) % 12 == 0) {
        month = 0;
        year++;
      }
    }

    return monthIntervals;
  }

  build() {
    const dates = this.generateDates();
    const list = [];

    for (let date of dates) {
      list.push({
        customer: this.customer,
        customerType: this.customerType,
        date,
      });
    }

    return list;
  }
}

export class CustomerMonthActivityLogBuilder extends BaseMonthActivityBuilder {
  constructor(customer) {
    super(customer);
    this.customerType = CUSTOMER_CONTENT_TYPES.CUSTOMER;
  }
}

export class CompanyMonthActivityLogBuilder extends BaseMonthActivityBuilder {
  constructor(customer) {
    super(customer);
    this.customerType = CUSTOMER_CONTENT_TYPES.COMPANY;
  }
}

export default {
  sendEmail,
  sendNotification,
  readFile,
  createTransporter,
  CustomerMonthActivityLogBuilder,
  CompanyMonthActivityLogBuilder,
};
