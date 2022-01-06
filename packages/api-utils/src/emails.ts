import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as AWS from 'aws-sdk';

import { EMAIL_DELIVERY_STATUS } from './constants';
import { getConfig, getEnv } from './core';
import { debugEmail } from './debuggers';

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
  let folder = 'dist';

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

/**
 * Send email
 */
export const sendEmail = async (
  models,
  memoryStorage,
  params: IEmailParams
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
  } = params;

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const DEFAULT_EMAIL_SERVICE = await getConfig(
    models,
    memoryStorage,
    'DEFAULT_EMAIL_SERVICE',
    'SES'
  );
  const defaultTemplate = await getConfig(
    models,
    memoryStorage,
    'COMPANY_EMAIL_TEMPLATE'
  );
  const defaultTemplateType = await getConfig(
    models,
    memoryStorage,
    'COMPANY_EMAIL_TEMPLATE_TYPE'
  );
  const COMPANY_EMAIL_FROM = await getConfig(
    models,
    memoryStorage,
    'COMPANY_EMAIL_FROM',
    ''
  );
  const AWS_SES_CONFIG_SET = await getConfig(
    models,
    memoryStorage,
    'AWS_SES_CONFIG_SET',
    ''
  );
  const AWS_SES_ACCESS_KEY_ID = await getConfig(
    models,
    memoryStorage,
    'AWS_SES_ACCESS_KEY_ID',
    ''
  );
  const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
    models,
    memoryStorage,
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
    transporter = await createTransporter(models, memoryStorage, {
      ses: DEFAULT_EMAIL_SERVICE === 'SES',
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
      attachments,
    };

    if (!mailOptions.from) {
      throw new Error(`"From" email address is missing: ${mailOptions.from}`);
    }

    let headers: { [key: string]: string } = {};

    if (
      AWS_SES_ACCESS_KEY_ID.length > 0 &&
      AWS_SES_SECRET_ACCESS_KEY.length > 0
    ) {
      const emailDelivery = await models.EmailDeliveries.create({
        kind: 'transaction',
        to: toEmail,
        from: mailOptions.from,
        subject: title,
        body: html,
        status: EMAIL_DELIVERY_STATUS.PENDING,
      });

      headers = {
        'X-SES-CONFIGURATION-SET': AWS_SES_CONFIG_SET || 'erxes',
        EmailDeliveryId: emailDelivery._id,
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
 * Create default or ses transporter
 */
export const createTransporter = async (models, memoryStorage, { ses }) => {
  if (ses) {
    const AWS_SES_ACCESS_KEY_ID = await getConfig(
      models,
      memoryStorage,
      'AWS_SES_ACCESS_KEY_ID'
    );
    const AWS_SES_SECRET_ACCESS_KEY = await getConfig(
      models,
      memoryStorage,
      'AWS_SES_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = await getConfig(models, memoryStorage, 'AWS_REGION');

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' }),
    });
  }

  const MAIL_SERVICE = await getConfig(models, memoryStorage, 'MAIL_SERVICE');
  const MAIL_PORT = await getConfig(models, memoryStorage, 'MAIL_PORT');
  const MAIL_USER = await getConfig(models, memoryStorage, 'MAIL_USER');
  const MAIL_PASS = await getConfig(models, memoryStorage, 'MAIL_PASS');
  const MAIL_HOST = await getConfig(models, memoryStorage, 'MAIL_HOST');

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
