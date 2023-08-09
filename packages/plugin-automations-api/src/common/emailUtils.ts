import {
  sendCommonMessage,
  sendCoreMessage,
  sendEmailTemplateMessage
} from '../messageBroker';
import { EMAIL_RECIEPENTS_TYPES } from '../constants';
import { serviceDiscovery } from '../configs';

export const generateEmailDoc = async ({
  subdomain,
  target,
  triggerType,
  config
}) => {
  const { templateId, fromUserId, recipientType } = config;
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
    type: recipientType,
    config,
    triggerType,
    target
  });

  if (!fromUser?.email || !toEmails?.length) {
    return null;
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
  type,
  triggerType,
  target
}) => {
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

  const reciepentType: any = reciepentTypes.find(
    reciepentType => reciepentType.type === type
  );

  const fieldName = reciepentType?.name || '';

  if (reciepentType?.type === 'teamMember') {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: config[fieldName] || [] }
        }
      },
      isRPC: true
    });

    return users.map(user => user.email);
  }

  if (reciepentType?.type === 'triggerAttributionMails') {
    const matches = (config[fieldName] || '').match(/\{\{\s*([^}]+)\s*\}\}/g);

    const attributes = matches.map(match =>
      match.replace(/\{\{\s*|\s*\}\}/g, '')
    );

    const relateivedValueProps = {};

    for (const attribute of attributes) {
      relateivedValueProps[attribute] = {
        key: 'email',
        filter: { key: 'registrationToken', value: null }
      };
    }

    const result = await sendCommonMessage({
      subdomain,
      serviceName: triggerType.split(':')[0],
      action: 'automations.replacePlaceHolders',
      data: {
        target,
        config: { [fieldName]: config[fieldName] },
        relateivedValueProps
      },
      isRPC: true,
      defaultValue: {}
    });

    return result[fieldName].split(', ');
  }

  if (reciepentType?.serviceName) {
    const { serviceName } = reciepentType;

    return await sendCommonMessage({
      subdomain,
      serviceName,
      action: 'automations.getReciepentsEmails',
      data: {
        type,
        config
      },
      isRPC: true
    });
  }

  return config[type];
};

export const sendEmail = async ({ subdomain, target, triggerType, config }) => {
  const data = await generateEmailDoc({
    subdomain,
    triggerType,
    target,
    config
  });

  if (!data) {
    return { error: 'Something went wrong fetching data' };
  }
  await sendCoreMessage({
    subdomain,
    action: 'sendEmail',
    data,
    isRPC: true
  });
  return data;
};
