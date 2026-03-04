import { getConfig } from '@/organization/settings/utils/configs';
import { IEmailParams } from '@/organization/types';
import * as AWS from 'aws-sdk';
import { getEnv } from 'erxes-api-shared/utils';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import { IModels } from '~/connectionResolvers';
import { applyTemplate } from '~/utils/common';

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
    userId,
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
    //   return debugError(e.message);
    console.log(e);
    return;
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
      await modifier(data, toEmail);
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
      const emailDelivery = await models.EmailDeliveries.createEmailDelivery({
        kind: 'transaction',
        to: [toEmail],
        from: mailOptions.from,
        subject: title || '',
        content: html,
        status: 'pending',
        provider: sendgridMail ? 'sendgrid' : transporter ? 'ses' : 'smtp',
        userId,
        email: toEmail,
      });

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
        await sendgridMail.send(mailOptions).catch((error) => {
          console.error(error);

          if (error.response) {
            console.error(error.response.body);
          }
        });
      } else {
        await transporter.sendMail(mailOptions);
      }

      console.log(
        `Email sent successfully: ${toEmail} from ${mailOptions.from}`,
      );
    } catch (e) {
      // debugError(`Error sending email: ${e.message}`);
      console.log(`Error sending email: ${e.message}`);
    }
  }
};
