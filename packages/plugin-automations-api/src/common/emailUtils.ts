import {
  sendCommonMessage,
  sendCoreMessage,
  sendEmailTemplateMessage,
  sendLogsMessage,
  sendSegmentsMessage
} from '../messageBroker';
import { EMAIL_RECIEPENTS_TYPES } from '../constants';
import { serviceDiscovery } from '../configs';
import { getEnv } from '../utils';
import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

export const getEmailRecipientTypes = async () => {
  let reciepentTypes = [...EMAIL_RECIEPENTS_TYPES];

  const services = await serviceDiscovery.getServices();

  for (const serviceName of services) {
    const service = await serviceDiscovery.getService(serviceName, true);
    const meta = service.config?.meta || {};

    if (meta?.automations?.constants?.emailReciepentTypes) {
      const { emailReciepentTypes } = meta?.automations?.constants || {};

      reciepentTypes = [
        ...reciepentTypes,
        ...emailReciepentTypes.map(eTR => ({ ...eTR, serviceName }))
      ];
    }
  }
  return reciepentTypes;
};

export const generateEmailDoc = async ({
  subdomain,
  target,
  execution,
  triggerType,
  config
}) => {
  const { templateId, fromUserId } = config;
  const [serviceName] = triggerType.split(':');

  const template = await sendEmailTemplateMessage({
    subdomain,
    action: 'findOne',
    data: {
      _id: templateId
    },
    isRPC: true,
    defaultValue: null
  });

  const fromUser = await sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: {
      _id: fromUserId
    },
    isRPC: true
  });

  const { subject } = await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'automations.replacePlaceHolders',
    data: {
      target,
      config: { subject: config.subject }
    },
    isRPC: true,
    defaultValue: {}
  });

  const toEmails = await getReciepentEmails({
    subdomain,
    config,
    triggerType,
    target,
    execution
  });

  if (!fromUser?.email) {
    throw new Error('From Email not found');
  }

  if (!toEmails?.length) {
    throw new Error('Recieving emails not found');
  }

  const payload = {
    title: subject,
    fromEmail: fromUser.email,
    toEmails,
    customHtml: template.content
  };

  return payload;
};

export const getReciepentEmails = async ({
  subdomain,
  config,
  triggerType,
  target,
  execution
}) => {
  let toEmails: string[] = [];
  const reciepentTypes: any = await getEmailRecipientTypes();

  const reciepentTypeKeys = reciepentTypes.map(rT => rT.name);

  for (const key of Object.keys(config)) {
    if (reciepentTypeKeys.includes(key)) {
      const { serviceName, type } = reciepentTypes.find(rT => rT.name === key);

      if (type === 'teamMember') {
        const users = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: {
              _id: { $in: config[key] || [] }
            }
          },
          isRPC: true
        });

        toEmails = [
          ...toEmails,
          ...users.map(user => user.email).filter(email => email)
        ];
        continue;
      }

      if (type === 'attributionMail') {
        const matches = (config[key] || '').match(/\{\{\s*([^}]+)\s*\}\}/g);
        const attributes = matches.map(match =>
          match.replace(/\{\{\s*|\s*\}\}/g, '')
        );
        const relateivedValueProps = {};
        for (const attribute of attributes) {
          relateivedValueProps[attribute] = {
            key: 'email',
            filter: {
              key: 'registrationToken',
              value: null
            }
          };
        }
        const emails = await sendCommonMessage({
          subdomain,
          serviceName: triggerType.split(':')[0],
          action: 'automations.replacePlaceHolders',
          data: {
            target,
            config: {
              [type]: config[key]
            },
            relateivedValueProps
          },
          isRPC: true,
          defaultValue: {}
        });
        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (type === 'segmentBased') {
        const { triggerConfig } = execution;
        const [serviceName, contentType] = triggerType.split(':');
        const result = await sendSegmentsMessage({
          subdomain,
          action: 'fetchSegment',
          data: {
            segmentId: triggerConfig.contentId
          },
          isRPC: true,
          defaultValue: []
        });
        const emails = await sendCommonMessage({
          subdomain,
          serviceName,
          action: 'automations.getReciepentsEmails',
          data: {
            type: contentType,
            config: {
              [`${contentType}Ids`]: result
            }
          },
          isRPC: true
        });

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (type === 'customMail') {
        const emails = config[key] || [];

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (!!serviceName) {
        const emails = await sendCommonMessage({
          subdomain,
          serviceName,
          action: 'automations.getReciepentsEmails',
          data: {
            type,
            config
          },
          isRPC: true
        });

        toEmails = [...toEmails, ...emails];
        continue;
      }
    }
  }

  return [...new Set(toEmails)];
};

export const handleEmail = async ({
  subdomain,
  target,
  execution,
  triggerType,
  config
}) => {
  const data: any = await generateEmailDoc({
    subdomain,
    triggerType,
    target,
    config,
    execution
  });

  if (!data) {
    return { error: 'Something went wrong fetching data' };
  }
  const responses = await sendEmails({
    subdomain,
    params: data
  });

  delete data?.customHtml;

  return { ...data, responses };
};

const createTransporter = async ({ ses }, configs) => {
  if (ses) {
    const AWS_SES_ACCESS_KEY_ID = configs['AWS_SES_ACCESS_KEY_ID'] || '';
    const AWS_SES_SECRET_ACCESS_KEY =
      configs['AWS_SES_SECRET_ACCESS_KEY'] || '';
    const AWS_REGION = configs['AWS_REGION'] || '';

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' })
    });
  }

  const MAIL_SERVICE = configs['MAIL_SERVICE'] || '';
  const MAIL_PORT = configs['MAIL_PORT'] || '';
  const MAIL_USER = configs['MAIL_USER'] || '';
  const MAIL_PASS = configs['MAIL_PASS'] || '';
  const MAIL_HOST = configs['MAIL_HOST'] || '';

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

const sendEmails = async ({
  subdomain,
  params
}: {
  subdomain: string;
  params: any;
}) => {
  const { toEmails = [], fromEmail, title, customHtml, attachments } = params;

  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: {}
  });

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  const DEFAULT_EMAIL_SERVICE = configs['DEFAULT_EMAIL_SERVICE'] || 'SES';
  const COMPANY_EMAIL_FROM = configs['COMPANY_EMAIL_FROM'] || '';
  const AWS_SES_CONFIG_SET = configs['AWS_SES_CONFIG_SET'] || '';
  const AWS_SES_ACCESS_KEY_ID = configs['AWS_SES_ACCESS_KEY_ID'] || '';
  const AWS_SES_SECRET_ACCESS_KEY = configs['AWS_SES_SECRET_ACCESS_KEY'] || '';

  if (NODE_ENV === 'test') {
    return;
  }

  let transporter;

  try {
    transporter = await createTransporter(
      { ses: DEFAULT_EMAIL_SERVICE === 'SES' },
      configs
    );
  } catch (e) {
    return debugError(e.message);
  }

  const responses: any[] = [];
  for (const toEmail of toEmails) {
    const mailOptions: any = {
      from: fromEmail || COMPANY_EMAIL_FROM,
      to: toEmail,
      subject: title,
      html: customHtml,
      attachments
    };
    let headers: { [key: string]: string } = {};

    if (
      !!AWS_SES_ACCESS_KEY_ID?.length &&
      !!AWS_SES_SECRET_ACCESS_KEY.length &&
      (await isEnabled('logs'))
    ) {
      const emailDelivery = await sendLogsMessage({
        subdomain,
        action: 'emailDeliveries.create',
        data: {
          kind: 'transaction',
          to: toEmail,
          from: fromEmail,
          subject: title,
          body: customHtml,
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

    if (!mailOptions.from) {
      throw new Error(`"From" email address is missing: ${mailOptions.from}`);
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      responses.push({ messageId: info.messageId, toEmail });
    } catch (error) {
      responses.push({ fromEmail, toEmail, error });
      debugError(error);
    }
  }

  return responses;
};
