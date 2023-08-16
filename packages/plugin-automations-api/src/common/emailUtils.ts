import {
  sendCommonMessage,
  sendCoreMessage,
  sendEmailTemplateMessage,
  sendLogsMessage,
  sendSegmentsMessage
} from '../messageBroker';
import { EMAIL_RECIPIENTS_TYPES } from '../constants';
import { serviceDiscovery } from '../configs';
import { getEnv } from '../utils';
import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

export const getEmailRecipientTypes = async () => {
  let reciepentTypes = [...EMAIL_RECIPIENTS_TYPES];

  const services = await serviceDiscovery.getServices();

  for (const serviceName of services) {
    const service = await serviceDiscovery.getService(serviceName, true);
    const meta = service.config?.meta || {};

    if (meta?.automations?.constants?.emailRecipIentTypes) {
      const { emailRecipIentTypes } = meta?.automations?.constants || {};

      reciepentTypes = [
        ...reciepentTypes,
        ...emailRecipIentTypes.map(eTR => ({ ...eTR, serviceName }))
      ];
    }
  }
  return reciepentTypes;
};

const generateEmails = (entry, key?) => {
  if (Array.isArray(entry)) {
    return entry
      .map(item => item[key])
      .filter(value =>
        value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      );
  }

  if (typeof entry === 'string') {
    return entry
      .split(', ')
      .filter(value =>
        value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      );
  }

  return [];
};

const getTeamMemberEmails = async ({ subdomain, params }) => {
  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        ...params
      }
    },
    isRPC: true
  });

  return generateEmails(users, 'email');
};

const getAttributionEmails = async ({
  subdomain,
  serviceName,
  contentType,
  target,
  value,
  key
}) => {
  const matches = (value || '').match(/\{\{\s*([^}]+)\s*\}\}/g);
  const attributes = matches.map(match =>
    match.replace(/\{\{\s*|\s*\}\}/g, '')
  );
  const relatedValueProps = {};
  for (const attribute of attributes) {
    relatedValueProps[attribute] = {
      key: 'email',
      filter: {
        key: 'registrationToken',
        value: null
      }
    };

    if (['customers', 'companies'].includes(attribute)) {
      relatedValueProps[attribute] = {
        key: 'primaryEmail'
      };
      target[attribute] = null;
    }
  }

  const replacedContent = await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'automations.replacePlaceHolders',
    data: {
      target: { ...target, type: contentType },
      config: {
        [key]: value
      },
      relatedValueProps
    },
    isRPC: true,
    defaultValue: {}
  });

  return generateEmails(replacedContent[key]);
};

const getSegmentEmails = async ({
  subdomain,
  serviceName,
  contentType,
  execution
}) => {
  const { triggerConfig, targetId } = execution;
  const contentTypeIds = await sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: {
      segmentId: triggerConfig.contentId,
      options: {
        defaultMustSelector: [
          {
            match: {
              _id: targetId
            }
          }
        ]
      }
    },
    isRPC: true,
    defaultValue: []
  });

  if (contentType === 'user') {
    return getTeamMemberEmails({
      subdomain,
      params: { _id: { $in: contentTypeIds } }
    });
  }

  return await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'automations.getRecipientsEmails',
    data: {
      type: contentType,
      config: {
        [`${contentType}Ids`]: contentTypeIds
      }
    },
    isRPC: true
  });
};

export const generateDoc = async ({
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

  const { subject, content } = await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'automations.replacePlaceHolders',
    data: {
      target,
      config: { subject: config.subject, content: template.content }
    },
    isRPC: true,
    defaultValue: {}
  });

  const toEmails = await getRecipientEmails({
    subdomain,
    config,
    triggerType,
    target,
    execution
  });

  if (!toEmails?.length) {
    return { error: 'Recieving emails not found' };
  }

  return {
    title: subject,
    fromEmail: fromUser?.email,
    toEmails: toEmails.filter(email => fromUser.email !== email),
    customHtml: content
  };
};

export const getRecipientEmails = async ({
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
      const [serviceName, contentType] = triggerType.split(':');

      const { type, ...reciepentType } = reciepentTypes.find(
        rT => rT.name === key
      );

      if (type === 'teamMember') {
        const emails = await getTeamMemberEmails({
          subdomain,
          params: {
            _id: { $in: config[key] || [] }
          }
        });

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (type === 'attributionMail') {
        const emails = await getAttributionEmails({
          subdomain,
          serviceName,
          contentType,
          target,
          value: config[key],
          key: type
        });

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (type === 'segmentBased') {
        const emails = await getSegmentEmails({
          subdomain,
          serviceName,
          contentType,
          execution
        });

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (type === 'customMail') {
        const emails = config[key] || [];

        toEmails = [...toEmails, ...emails];
        continue;
      }

      if (!!reciepentType.serviceName) {
        const emails = await sendCommonMessage({
          subdomain,
          serviceName: reciepentType.serviceName,
          action: 'automations.getRecipientsEmails',
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
  const data: any = await generateDoc({
    subdomain,
    triggerType,
    target,
    config,
    execution
  });

  if (!data) {
    return { error: 'Something went wrong fetching data' };
  }

  try {
    const responses = await sendEmails({
      subdomain,
      params: data
    });

    delete data?.customHtml;
    return { ...data, responses };
  } catch (err) {
    return { error: err.message };
  }
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

  if (!fromEmail && !COMPANY_EMAIL_FROM) {
    throw new Error('From Email is required');
  }

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
